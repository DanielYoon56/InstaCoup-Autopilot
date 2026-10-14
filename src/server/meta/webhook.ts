import crypto from 'node:crypto';
import { MetaDmStore } from './store';
import { MetaPrivateReplyService } from './service';
import { matchTriggerKeyword } from './rules';
import {
  MetaEnvConfig,
  InstagramWebhookPayload,
  InstagramCommentWebhookValue,
} from './types';

export interface WebhookGetResult {
  status: number;
  body: string;
}

export interface WebhookPostResult {
  status: number;
  body: string;
  processedCount: number;
  skippedCount: number;
}

/**
 * Handles GET /api/webhooks/instagram (Meta Handshake Verification).
 * Timing-safe comparison. Fails closed with 503 if META_VERIFY_TOKEN is missing.
 */
export function handleWebhookGet(
  query: Record<string, any>,
  verifyToken?: string
): WebhookGetResult {
  if (!verifyToken || !verifyToken.trim()) {
    return {
      status: 503,
      body: 'META_VERIFY_TOKEN is not configured on the server.',
    };
  }

  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode !== 'subscribe') {
    return {
      status: 400,
      body: 'Invalid hub.mode parameter (expected "subscribe").',
    };
  }

  if (typeof challenge !== 'string' || !challenge) {
    return {
      status: 400,
      body: 'Missing or invalid hub.challenge parameter.',
    };
  }

  if (typeof token !== 'string') {
    return {
      status: 403,
      body: 'Missing hub.verify_token.',
    };
  }

  const expectedBuf = Buffer.from(verifyToken, 'utf8');
  const actualBuf = Buffer.from(token, 'utf8');

  if (
    expectedBuf.length === actualBuf.length &&
    crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return {
      status: 200,
      body: challenge,
    };
  }

  return {
    status: 403,
    body: 'Verification token mismatch.',
  };
}

/**
 * Validates Meta HMAC SHA-256 signature against the raw body buffer.
 * Header format: sha256=<hex-digest>
 */
export function verifyMetaSignature(
  rawBody: Buffer | undefined,
  signatureHeader: string | undefined,
  appSecret: string | undefined
): { ok: boolean; status: number; error?: string } {
  if (!appSecret || !appSecret.trim()) {
    return {
      ok: false,
      status: 503,
      error: 'META_APP_SECRET is not configured on the server.',
    };
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return {
      ok: false,
      status: 401,
      error: 'Missing or malformed X-Hub-Signature-256 header.',
    };
  }

  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    return {
      ok: false,
      status: 400,
      error: 'Raw request body buffer unavailable for signature verification.',
    };
  }

  const signatureHex = signatureHeader.substring('sha256='.length).trim();
  const hmac = crypto.createHmac('sha256', appSecret.trim());
  hmac.update(rawBody);
  const expectedHex = hmac.digest('hex');

  const sigBuf = Buffer.from(signatureHex, 'utf8');
  const expBuf = Buffer.from(expectedHex, 'utf8');

  if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { ok: true, status: 200 };
  }

  return {
    ok: false,
    status: 403,
    error: 'Invalid X-Hub-Signature-256 signature.',
  };
}

/**
 * Handles POST /api/webhooks/instagram
 * Strictly enforces:
 * 1. Signature verification BEFORE any processing or DB write
 * 2. 7-day Private Reply time window
 * 3. Self-comment filter
 * 4. Rule-based media lookup (fail-closed on unlisted media)
 * 5. Trigger keyword filter
 * 6. Atomic SQLite deduplication & 24h user cooldown
 * 7. Server-side META_DM_ENABLED gating
 */
export async function handleWebhookPost(
  rawBody: Buffer | undefined,
  signatureHeader: string | undefined,
  config: MetaEnvConfig,
  store: MetaDmStore,
  replyService: MetaPrivateReplyService,
  clockFn: () => number = () => Date.now()
): Promise<WebhookPostResult> {
  // STEP 1: Verify HMAC signature FIRST
  const sigCheck = verifyMetaSignature(rawBody, signatureHeader, config.appSecret);
  if (!sigCheck.ok) {
    return {
      status: sigCheck.status,
      body: sigCheck.error || 'Signature check failed',
      processedCount: 0,
      skippedCount: 0,
    };
  }

  // STEP 2: Parse JSON payload
  let payload: InstagramWebhookPayload;
  try {
    payload = JSON.parse(rawBody!.toString('utf8'));
  } catch {
    return {
      status: 400,
      body: 'Malformed JSON payload.',
      processedCount: 0,
      skippedCount: 0,
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      status: 400,
      body: 'Invalid payload structure.',
      processedCount: 0,
      skippedCount: 0,
    };
  }

  if (payload.object !== 'instagram' && payload.object !== 'page') {
    return {
      status: 404,
      body: 'Unsupported webhook object type.',
      processedCount: 0,
      skippedCount: 0,
    };
  }

  const nowMs = clockFn();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

  let processedCount = 0;
  let skippedCount = 0;

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'comments') continue;

      const comment: InstagramCommentWebhookValue = change.value;
      if (!comment || !comment.id) continue;

      const commentId = String(comment.id).trim();
      const commentText = String(comment.text || '').trim();
      const senderId = String(comment.from?.id || 'unknown').trim();
      const senderUsername = String(comment.from?.username || 'user').trim();
      const mediaId = String(comment.media?.id || '').trim();
      const mediaType = String(comment.media?.media_product_type || '').toUpperCase();
      const accountId = String(config.instagramAccountId || config.pageId || entry.id || 'default');

      // Check 1: Instagram Live comments are explicitly unsupported in this version
      if (mediaType === 'LIVE' || comment.is_live === true) {
        store.recordSkipped({
          commentId,
          mediaId,
          accountId,
          senderId,
          senderUsername,
          status: 'SKIPPED_LIVE',
          reason: 'Instagram Live comments are unsupported in this release.',
          nowMs,
        });
        skippedCount++;
        continue;
      }

      // Check 2: 7-day Private Reply time window and timestamp validation
      // Meta allows Private Replies strictly within 7 days of comment creation.
      const commentTimeSec = comment.created_time || (entry.time ? Math.floor(entry.time / 1000) : 0);
      const commentTimeMs = commentTimeSec * 1000;

      if (!commentTimeMs || commentTimeMs > nowMs + 60000 || nowMs - commentTimeMs > SEVEN_DAYS_MS) {
        store.recordSkipped({
          commentId,
          mediaId,
          accountId,
          senderId,
          senderUsername,
          status: 'SKIPPED_EXPIRED',
          reason: `Comment timestamp (${commentTimeMs}) outside 7-day window or in future.`,
          nowMs,
        });
        skippedCount++;
        continue;
      }

      // Check 3: Self-comment filter
      const isSelfComment =
        (config.pageId && senderId === config.pageId) ||
        (config.instagramAccountId && senderId === config.instagramAccountId) ||
        (config.instagramAccountId && senderUsername.toLowerCase() === config.instagramAccountId.toLowerCase());

      if (isSelfComment) {
        store.recordSkipped({
          commentId,
          mediaId,
          accountId,
          senderId,
          senderUsername,
          status: 'SKIPPED_SELF',
          reason: 'Self-comment from page/account owner ignored.',
          nowMs,
        });
        skippedCount++;
        continue;
      }

      // Check 4: Media rule lookup in DM_RULES_JSON (Fail-closed!)
      if (!mediaId || !config.rules[mediaId]) {
        store.recordSkipped({
          commentId,
          mediaId,
          accountId,
          senderId,
          senderUsername,
          status: 'SKIPPED_NO_RULE',
          reason: `Media ID "${mediaId}" has no registered mapping in server DM_RULES_JSON.`,
          nowMs,
        });
        skippedCount++;
        continue;
      }

      const rule = config.rules[mediaId];

      // Check 5: Trigger keyword match
      const matchedKeyword = matchTriggerKeyword(commentText, rule.triggerKeywords);
      if (!matchedKeyword) {
        store.recordSkipped({
          commentId,
          mediaId,
          accountId,
          senderId,
          senderUsername,
          status: 'SKIPPED_KEYWORD',
          reason: `Comment text "${commentText}" did not match trigger keywords [${rule.triggerKeywords.join(', ')}].`,
          nowMs,
        });
        skippedCount++;
        continue;
      }

      // Check 6: Server-side DM Enabled & token availability
      if (!config.metaDmEnabled || !config.pageAccessToken || !config.pageId) {
        store.recordSkipped({
          commentId,
          mediaId,
          accountId,
          senderId,
          senderUsername,
          status: 'DISABLED',
          matchedKeyword,
          reason: 'Server META_DM_ENABLED=false or missing INSTAGRAM_ACCESS_TOKEN / FACEBOOK_PAGE_ID.',
          nowMs,
        });
        skippedCount++;
        continue;
      }

      // Check 7: Atomic reservation (checks unique commentId & 24h user cooldown)
      const reserveResult = store.reserveComment({
        commentId,
        mediaId,
        accountId,
        senderId,
        senderUsername,
        matchedKeyword,
        nowMs,
        cooldownMs: COOLDOWN_24H_MS,
      });

      if (!reserveResult.reserved) {
        skippedCount++;
        continue;
      }

      // Composed message strictly complying with FTC guidelines (no unverified guarantee claims)
      const dmText = `안녕하세요 @${senderUsername}님! 문의주신 [${rule.productName}] 쿠팡 파트너스 안내 링크입니다:
🔗 ${rule.affiliateUrl}

※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.`;

      // Outbound dispatch via MetaPrivateReplyService
      await replyService.sendPrivateReply({
        commentId,
        accountId,
        senderId,
        senderUsername,
        mediaId,
        dmText,
        matchedKeyword,
      });

      processedCount++;
    }
  }

  return {
    status: 200,
    body: 'EVENT_RECEIVED',
    processedCount,
    skippedCount,
  };
}
