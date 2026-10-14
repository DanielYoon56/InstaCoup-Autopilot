/**
 * Meta Instagram Messaging Private Replies & Webhook Type Definitions
 * Strictly follows official Meta Documentation:
 * https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/private-replies
 */

export type MetaDmStatus =
  | 'ACCEPTED' // Meta Graph API returned 200 + actual message_id (accepted by platform, NOT delivered/read)
  | 'PROCESSING' // Reserved in transactional SQLite queue, dispatch in progress
  | 'FAILED' // Meta Graph API 4xx/5xx or unrecoverable error
  | 'UNCERTAIN' // Network timeout or ambiguous socket drop (held uncertain, NEVER auto-retried to prevent duplicates)
  | 'SKIPPED_DUPLICATE' // Comment ID already processed or currently processing
  | 'SKIPPED_COOLDOWN' // User already received a DM within the 24-hour cooldown window
  | 'SKIPPED_KEYWORD' // Comment does not match any registered trigger keyword
  | 'SKIPPED_NO_RULE' // Media ID not registered in server DM_RULES_JSON
  | 'SKIPPED_INVALID_LINK' // Registered affiliate URL is a placeholder or invalid (fail-closed)
  | 'SKIPPED_EXPIRED' // Comment is older than 7-day Private Reply window or has invalid/future timestamp
  | 'SKIPPED_SELF' // Comment was written by the page / account itself
  | 'SKIPPED_LIVE' // Instagram Live comment (unsupported in this release)
  | 'DISABLED' // Server META_DM_ENABLED !== 'true' or access token unconfigured
  | 'SIMULATED' // Interactive simulator test event (no external API calls made)
  | 'PREPARED'; // Manychat external adapter response (prepared custom field payload)

export interface DmRule {
  mediaId: string;
  productName: string;
  affiliateUrl: string;
  triggerKeywords: string[];
}

export interface MetaEnvConfig {
  pageAccessToken?: string;
  pageId?: string;
  instagramAccountId?: string;
  appId?: string;
  appSecret?: string;
  verifyToken?: string;
  graphApiVersion: string; // e.g. 'v26.0' (configurable, no claim of permanent support)
  metaDmEnabled: boolean;
  rules: Record<string, DmRule>;
  sqliteDbPath: string;
  serverAdminSecret?: string;
}

export interface MetaAuditLog {
  id: string;
  commentId: string;
  mediaId: string;
  accountId: string;
  senderIdMasked: string;
  senderUsernameMasked: string;
  matchedKeyword?: string;
  status: MetaDmStatus;
  messageId?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface ProcessedCommentRecord {
  commentId: string;
  mediaId: string;
  accountId: string;
  senderId: string;
  senderUsername: string;
  status: MetaDmStatus;
  messageId?: string;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InstagramCommentWebhookValue {
  id: string;
  text?: string;
  from?: {
    id: string;
    username: string;
  };
  media?: {
    id: string;
    media_product_type?: string; // 'FEED', 'REELS', 'LIVE', etc.
  };
  created_time?: number; // UNIX timestamp in seconds
  parent_id?: string;
  is_live?: boolean;
}

export interface InstagramWebhookEntryChange {
  field: string;
  value: InstagramCommentWebhookValue;
}

export interface InstagramWebhookEntry {
  id: string;
  time: number;
  changes?: InstagramWebhookEntryChange[];
}

export interface InstagramWebhookPayload {
  object: string; // 'instagram' or 'page'
  entry?: InstagramWebhookEntry[];
}
