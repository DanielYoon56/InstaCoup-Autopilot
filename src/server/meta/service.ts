import { MetaDmStore } from './store';
import { MetaDmStatus } from './types';

export interface MetaPrivateReplyServiceOptions {
  pageId: string;
  pageAccessToken: string;
  graphApiVersion?: string; // Default 'v26.0'
  store: MetaDmStore;
  fetchFn?: typeof fetch;
  clockFn?: () => number;
  timeoutMs?: number;
}

export interface DispatchResult {
  ok: boolean;
  status: MetaDmStatus;
  messageId?: string;
  error?: string;
}

export class MetaPrivateReplyService {
  private pageId: string;
  private pageAccessToken: string;
  private graphApiVersion: string;
  private store: MetaDmStore;
  private fetchFn: typeof fetch;
  private clockFn: () => number;
  private timeoutMs: number;

  constructor(options: MetaPrivateReplyServiceOptions) {
    this.pageId = options.pageId;
    this.pageAccessToken = options.pageAccessToken;
    this.graphApiVersion = options.graphApiVersion || 'v26.0';
    this.store = options.store;
    this.fetchFn = options.fetchFn || globalThis.fetch;
    this.clockFn = options.clockFn || (() => Date.now());
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  /**
   * Executes official Meta Instagram Messaging Private Reply.
   * Endpoint: POST https://graph.facebook.com/{version}/{FACEBOOK_PAGE_ID}/messages
   * Payload: { recipient: { comment_id: COMMENT_ID }, message: { text: DM_TEXT } }
   */
  public async sendPrivateReply(params: {
    commentId: string;
    accountId: string;
    senderId: string;
    senderUsername: string;
    mediaId: string;
    dmText: string;
    matchedKeyword?: string;
  }): Promise<DispatchResult> {
    const {
      commentId,
      accountId,
      senderId,
      senderUsername,
      mediaId,
      dmText,
      matchedKeyword,
    } = params;

    const nowMs = this.clockFn();
    const url = `https://graph.facebook.com/${this.graphApiVersion}/${this.pageId}/messages`;
    const payload = {
      recipient: {
        comment_id: commentId,
      },
      message: {
        text: dmText,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pageAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as any;
        const messageId = data?.message_id;

        if (messageId && typeof messageId === 'string') {
          // Status ACCEPTED strictly requires HTTP 200 + confirmed message_id from Meta
          this.store.finalizeDispatch({
            commentId,
            accountId,
            senderId,
            senderUsername,
            mediaId,
            status: 'ACCEPTED',
            messageId,
            matchedKeyword,
            nowMs,
          });

          return {
            ok: true,
            status: 'ACCEPTED',
            messageId,
          };
        } else {
          const err = 'Meta returned 200 OK but message_id was missing from response payload.';
          this.store.finalizeDispatch({
            commentId,
            accountId,
            senderId,
            senderUsername,
            mediaId,
            status: 'FAILED',
            errorMessage: err,
            matchedKeyword,
            nowMs,
          });
          return {
            ok: false,
            status: 'FAILED',
            error: err,
          };
        }
      } else {
        const errorJson = (await response.json().catch(() => ({}))) as any;
        const rawMsg =
          errorJson?.error?.message ||
          errorJson?.error?.error_user_msg ||
          `HTTP ${response.status} ${response.statusText}`;

        // Ensure token is never leaked in error string
        const sanitizedErr = sanitizeErrorMessage(rawMsg, this.pageAccessToken);

        this.store.finalizeDispatch({
          commentId,
          accountId,
          senderId,
          senderUsername,
          mediaId,
          status: 'FAILED',
          errorMessage: sanitizedErr,
          matchedKeyword,
          nowMs,
        });

        return {
          ok: false,
          status: 'FAILED',
          error: sanitizedErr,
        };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);

      // On timeout or uncertain network disconnect, mark UNCERTAIN.
      // CRITICAL: NEVER automatically re-send on UNCERTAIN, because the message
      // might have been delivered by Meta while the response socket timed out.
      const isAbort = err?.name === 'AbortError' || err?.message?.includes('aborted');
      const errorMsg = isAbort
        ? `Request timed out after ${this.timeoutMs}ms. Status held as UNCERTAIN to prevent duplicate DM.`
        : `Network socket error: ${err.message || 'unknown'}. Status held as UNCERTAIN.`;

      const sanitized = sanitizeErrorMessage(errorMsg, this.pageAccessToken);

      this.store.finalizeDispatch({
        commentId,
        accountId,
        senderId,
        senderUsername,
        mediaId,
        status: 'UNCERTAIN',
        errorMessage: sanitized,
        matchedKeyword,
        nowMs,
      });

      return {
        ok: false,
        status: 'UNCERTAIN',
        error: sanitized,
      };
    }
  }
}

export function sanitizeErrorMessage(msg: string, secretToken?: string): string {
  if (!msg) return 'Unknown error';
  let clean = msg;
  if (secretToken && secretToken.length > 5) {
    clean = clean.split(secretToken).join('[REDACTED_TOKEN]');
  }
  // Generic token pattern redaction
  clean = clean.replace(/EAA[A-Za-z0-9]+/g, '[REDACTED_ACCESS_TOKEN]');
  clean = clean.replace(/access_token=[^&\s]+/gi, 'access_token=[REDACTED]');
  return clean;
}
