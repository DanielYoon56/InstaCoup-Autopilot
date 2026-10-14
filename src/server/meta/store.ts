import { DatabaseSync } from 'node:sqlite';
import { MetaDmStatus, MetaAuditLog, ProcessedCommentRecord } from './types';
import fs from 'node:fs';
import path from 'node:path';

export interface ReserveResult {
  reserved: boolean;
  reason?: 'DUPLICATE' | 'COOLDOWN';
  existingStatus?: MetaDmStatus;
  cooldownUntilMs?: number;
}

export class MetaDmStore {
  private db: DatabaseSync;
  public readonly isPersistent: boolean;
  public readonly dbPath: string;

  constructor(dbPath: string = ':memory:') {
    this.dbPath = dbPath;
    this.isPersistent = dbPath !== ':memory:';

    if (this.isPersistent) {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  private initSchema(): void {
    // WAL mode for write concurrency if file-based
    if (this.isPersistent) {
      try {
        this.db.exec('PRAGMA journal_mode = WAL;');
      } catch {
        // Fallback for environments where WAL PRAGMA isn't supported
      }
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS processed_comments (
        comment_id TEXT PRIMARY KEY,
        media_id TEXT,
        account_id TEXT,
        sender_id TEXT,
        sender_username TEXT,
        status TEXT NOT NULL,
        message_id TEXT,
        error_message TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_cooldowns (
        account_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        last_sent_at INTEGER NOT NULL,
        PRIMARY KEY (account_id, sender_id)
      );

      CREATE TABLE IF NOT EXISTS meta_audit_logs (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL,
        media_id TEXT,
        account_id TEXT,
        sender_id_masked TEXT NOT NULL,
        sender_username_masked TEXT NOT NULL,
        matched_keyword TEXT,
        status TEXT NOT NULL,
        message_id TEXT,
        error_message TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_comments_status ON processed_comments(status);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON meta_audit_logs(created_at DESC);
    `);
  }

  /**
   * Atomically checks for duplicate comment ID and user cooldown,
   * then transitions the comment into PROCESSING state.
   */
  public reserveComment(params: {
    commentId: string;
    mediaId: string;
    accountId: string;
    senderId: string;
    senderUsername: string;
    matchedKeyword?: string;
    nowMs: number;
    cooldownMs: number;
  }): ReserveResult {
    const {
      commentId,
      mediaId,
      accountId,
      senderId,
      senderUsername,
      matchedKeyword,
      nowMs,
      cooldownMs,
    } = params;

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      // 1. Check duplicate comment ID
      const existing = this.db
        .prepare('SELECT status FROM processed_comments WHERE comment_id = ?')
        .get(commentId) as { status: string } | undefined;

      if (existing) {
        this.db.exec('COMMIT;');
        return {
          reserved: false,
          reason: 'DUPLICATE',
          existingStatus: existing.status as MetaDmStatus,
        };
      }

      // 2. Check user cooldown
      const cooldown = this.db
        .prepare('SELECT last_sent_at FROM user_cooldowns WHERE account_id = ? AND sender_id = ?')
        .get(accountId, senderId) as { last_sent_at: number } | undefined;

      if (cooldown && cooldown.last_sent_at) {
        const elapsed = nowMs - cooldown.last_sent_at;
        if (elapsed < cooldownMs) {
          const cooldownUntilMs = cooldown.last_sent_at + cooldownMs;
          // Record as SKIPPED_COOLDOWN in database so repeated queries hit duplicate filter
          this.db
            .prepare(
              `INSERT INTO processed_comments (
                comment_id, media_id, account_id, sender_id, sender_username,
                status, error_message, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, 'SKIPPED_COOLDOWN', ?, ?, ?)`
            )
            .run(
              commentId,
              mediaId,
              accountId,
              senderId,
              senderUsername,
              `24h cooldown active. Eligible after ${new Date(cooldownUntilMs).toISOString()}`,
              nowMs,
              nowMs
            );

          this.insertAuditLog({
            commentId,
            mediaId,
            accountId,
            senderId,
            senderUsername,
            matchedKeyword,
            status: 'SKIPPED_COOLDOWN',
            errorMessage: `Cooldown active (${Math.round((cooldownMs - elapsed) / 60000)}m remaining)`,
            nowMs,
          });

          this.db.exec('COMMIT;');
          return {
            reserved: false,
            reason: 'COOLDOWN',
            cooldownUntilMs,
          };
        }
      }

      // 3. Reserve comment in PROCESSING status
      this.db
        .prepare(
          `INSERT INTO processed_comments (
            comment_id, media_id, account_id, sender_id, sender_username,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'PROCESSING', ?, ?)`
        )
        .run(commentId, mediaId, accountId, senderId, senderUsername, nowMs, nowMs);

      this.insertAuditLog({
        commentId,
        mediaId,
        accountId,
        senderId,
        senderUsername,
        matchedKeyword,
        status: 'PROCESSING',
        nowMs,
      });

      this.db.exec('COMMIT;');
      return { reserved: true };
    } catch (err) {
      try {
        this.db.exec('ROLLBACK;');
      } catch {
        // Ignored
      }
      throw err;
    }
  }

  /**
   * Finalizes dispatch after Meta API call completes.
   */
  public finalizeDispatch(params: {
    commentId: string;
    accountId: string;
    senderId: string;
    status: 'ACCEPTED' | 'FAILED' | 'UNCERTAIN';
    messageId?: string;
    errorMessage?: string;
    matchedKeyword?: string;
    mediaId?: string;
    senderUsername?: string;
    nowMs: number;
  }): void {
    const {
      commentId,
      accountId,
      senderId,
      status,
      messageId,
      errorMessage,
      matchedKeyword,
      mediaId,
      senderUsername,
      nowMs,
    } = params;

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      this.db
        .prepare(
          `UPDATE processed_comments
           SET status = ?, message_id = ?, error_message = ?, updated_at = ?
           WHERE comment_id = ?`
        )
        .run(status, messageId || null, errorMessage || null, nowMs, commentId);

      // Only update cooldown when Meta officially accepted the message with a valid message_id
      if (status === 'ACCEPTED') {
        this.db
          .prepare(
            `INSERT INTO user_cooldowns (account_id, sender_id, last_sent_at)
             VALUES (?, ?, ?)
             ON CONFLICT(account_id, sender_id)
             DO UPDATE SET last_sent_at = excluded.last_sent_at`
          )
          .run(accountId, senderId, nowMs);
      }

      this.insertAuditLog({
        commentId,
        mediaId: mediaId || '',
        accountId,
        senderId,
        senderUsername: senderUsername || '',
        matchedKeyword,
        status,
        messageId,
        errorMessage,
        nowMs,
      });

      this.db.exec('COMMIT;');
    } catch (err) {
      try {
        this.db.exec('ROLLBACK;');
      } catch {
        // Ignored
      }
      throw err;
    }
  }

  /**
   * Records comments that were skipped before reservation (e.g. no keyword, expired, live, etc.)
   */
  public recordSkipped(params: {
    commentId: string;
    mediaId?: string;
    accountId?: string;
    senderId?: string;
    senderUsername?: string;
    status: MetaDmStatus;
    reason: string;
    nowMs: number;
    matchedKeyword?: string;
  }): void {
    const {
      commentId,
      mediaId = '',
      accountId = '',
      senderId = '',
      senderUsername = '',
      status,
      reason,
      nowMs,
      matchedKeyword,
    } = params;

    try {
      this.db
        .prepare(
          `INSERT INTO processed_comments (
            comment_id, media_id, account_id, sender_id, sender_username,
            status, error_message, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(comment_id) DO NOTHING`
        )
        .run(commentId, mediaId, accountId, senderId, senderUsername, status, reason, nowMs, nowMs);

      this.insertAuditLog({
        commentId,
        mediaId,
        accountId,
        senderId,
        senderUsername,
        matchedKeyword,
        status,
        errorMessage: reason,
        nowMs,
      });
    } catch (err) {
      console.error('Failed to record skipped comment in SQLite:', err);
    }
  }

  /**
   * Inserts an audit log entry with masked PII.
   */
  private insertAuditLog(params: {
    commentId: string;
    mediaId?: string;
    accountId?: string;
    senderId?: string;
    senderUsername?: string;
    matchedKeyword?: string;
    status: MetaDmStatus;
    messageId?: string;
    errorMessage?: string;
    nowMs: number;
  }): void {
    const {
      commentId,
      mediaId = '',
      accountId = '',
      senderId = '',
      senderUsername = '',
      matchedKeyword = '',
      status,
      messageId = null,
      errorMessage = null,
      nowMs,
    } = params;

    const id = `log_${nowMs}_${Math.random().toString(36).substring(2, 8)}`;
    const senderIdMasked = maskIdentifier(senderId);
    const senderUsernameMasked = maskUsername(senderUsername);

    try {
      this.db
        .prepare(
          `INSERT INTO meta_audit_logs (
            id, comment_id, media_id, account_id, sender_id_masked, sender_username_masked,
            matched_keyword, status, message_id, error_message, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          commentId,
          mediaId,
          accountId,
          senderIdMasked,
          senderUsernameMasked,
          matchedKeyword,
          status,
          messageId,
          errorMessage,
          nowMs
        );
    } catch {
      // Best-effort audit logging
    }
  }

  public getCommentRecord(commentId: string): ProcessedCommentRecord | null {
    const row = this.db
      .prepare('SELECT * FROM processed_comments WHERE comment_id = ?')
      .get(commentId) as any;

    if (!row) return null;
    return {
      commentId: row.comment_id,
      mediaId: row.media_id,
      accountId: row.account_id,
      senderId: row.sender_id,
      senderUsername: row.sender_username,
      status: row.status as MetaDmStatus,
      messageId: row.message_id || undefined,
      errorMessage: row.error_message || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public getRecentLogs(limit: number = 50): MetaAuditLog[] {
    const rows = this.db
      .prepare(
        `SELECT id, comment_id, media_id, account_id, sender_id_masked,
                sender_username_masked, matched_keyword, status, message_id,
                error_message, created_at
         FROM meta_audit_logs
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .all(limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      commentId: r.comment_id,
      mediaId: r.media_id,
      accountId: r.account_id,
      senderIdMasked: r.sender_id_masked,
      senderUsernameMasked: r.sender_username_masked,
      matchedKeyword: r.matched_keyword || undefined,
      status: r.status as MetaDmStatus,
      messageId: r.message_id || undefined,
      errorMessage: r.error_message || undefined,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  public getMetrics(): {
    accepted: number;
    failed: number;
    uncertain: number;
    processing: number;
    skippedDuplicate: number;
    skippedCooldown: number;
    skippedOther: number;
    totalTracked: number;
  } {
    const counts = this.db
      .prepare(
        `SELECT status, COUNT(*) as count FROM processed_comments GROUP BY status`
      )
      .all() as Array<{ status: string; count: number }>;

    const map: Record<string, number> = {};
    for (const c of counts) {
      map[c.status] = Number(c.count) || 0;
    }

    const accepted = map['ACCEPTED'] || 0;
    const failed = map['FAILED'] || 0;
    const uncertain = map['UNCERTAIN'] || 0;
    const processing = map['PROCESSING'] || 0;
    const skippedDuplicate = map['SKIPPED_DUPLICATE'] || 0;
    const skippedCooldown = map['SKIPPED_COOLDOWN'] || 0;
    const skippedOther =
      (map['SKIPPED_KEYWORD'] || 0) +
      (map['SKIPPED_NO_RULE'] || 0) +
      (map['SKIPPED_INVALID_LINK'] || 0) +
      (map['SKIPPED_EXPIRED'] || 0) +
      (map['SKIPPED_SELF'] || 0) +
      (map['SKIPPED_LIVE'] || 0) +
      (map['DISABLED'] || 0);

    const totalTracked = Object.values(map).reduce((a, b) => a + b, 0);

    return {
      accepted,
      failed,
      uncertain,
      processing,
      skippedDuplicate,
      skippedCooldown,
      skippedOther,
      totalTracked,
    };
  }

  public close(): void {
    try {
      this.db.close();
    } catch {
      // Ignored
    }
  }
}

function maskIdentifier(id: string): string {
  if (!id) return '';
  if (id.length <= 4) return '***';
  return id.substring(0, 3) + '***' + id.substring(id.length - 2);
}

function maskUsername(username: string): string {
  if (!username) return 'user_***';
  if (username.length <= 3) return username[0] + '***';
  return username.substring(0, 3) + '***';
}
