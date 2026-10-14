import { DmRule } from './types';

/**
 * Parses and strictly validates DM_RULES_JSON environment variable.
 * Rules must map mediaId to { productName, affiliateUrl, triggerKeywords }.
 * Fail-closed policy:
 * - Empty or missing rules are rejected.
 * - Sample/placeholder links ('sample', 'b9X7mK', or non-https links) are rejected.
 * - No default broadcast of fallback product link to arbitrary comments.
 */
export function parseDmRulesJson(jsonStr?: string): {
  rules: Record<string, DmRule>;
  errors: string[];
} {
  const result: Record<string, DmRule> = {};
  const errors: string[] = [];

  if (!jsonStr || !jsonStr.trim()) {
    return { rules: result, errors: ['DM_RULES_JSON is empty or not configured.'] };
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Accept either Array of DmRule or Record<mediaId, DmRule>
    const list: DmRule[] = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null
        ? Object.values(parsed)
        : [];

    if (list.length === 0) {
      errors.push('No valid rules found in DM_RULES_JSON.');
      return { rules: result, errors };
    }

    for (const item of list) {
      if (!item || typeof item !== 'object') {
        errors.push('Invalid rule object encountered.');
        continue;
      }

      const mediaId = String(item.mediaId || '').trim();
      const productName = String(item.productName || '').trim();
      const affiliateUrl = String(item.affiliateUrl || '').trim();
      const rawKeywords = Array.isArray(item.triggerKeywords) ? item.triggerKeywords : [];
      const triggerKeywords = rawKeywords
        .map((k) => String(k || '').trim())
        .filter((k) => k.length > 0);

      if (!mediaId) {
        errors.push('Rule missing required mediaId.');
        continue;
      }
      if (!productName) {
        errors.push(`Rule for media ${mediaId} missing productName.`);
        continue;
      }
      if (!affiliateUrl) {
        errors.push(`Rule for media ${mediaId} missing affiliateUrl.`);
        continue;
      }

      // Strict check against sample / dummy / test placeholder URLs
      if (isSampleOrPlaceholderUrl(affiliateUrl)) {
        errors.push(
          `Rule for media ${mediaId} rejected: affiliateUrl "${affiliateUrl}" is a sample/placeholder link.`
        );
        continue;
      }

      if (triggerKeywords.length === 0) {
        errors.push(`Rule for media ${mediaId} has no triggerKeywords.`);
        continue;
      }

      result[mediaId] = {
        mediaId,
        productName,
        affiliateUrl,
        triggerKeywords,
      };
    }
  } catch (err: any) {
    errors.push(`Failed to parse DM_RULES_JSON: ${err.message}`);
  }

  return { rules: result, errors };
}

/**
 * Checks whether an affiliate URL is an unverified placeholder/sample URL.
 */
export function isSampleOrPlaceholderUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();

  if (!lower.startsWith('https://')) return true;
  if (lower.includes('sample')) return true;
  if (lower.includes('example.com')) return true;
  if (lower.includes('b9x7mk')) return true; // Known seed placeholder ID
  if (lower.endsWith('/a/') || lower.endsWith('/vp/')) return true;

  return false;
}

/**
 * Matches comment text against registered trigger keywords.
 * Returns the matched keyword or null if none matched.
 */
export function matchTriggerKeyword(commentText: string, keywords: string[]): string | null {
  if (!commentText || !Array.isArray(keywords)) return null;
  const trimmedText = commentText.trim().toLowerCase();

  for (const kw of keywords) {
    if (!kw) continue;
    const cleanKw = kw.trim().toLowerCase();
    if (cleanKw && trimmedText.includes(cleanKw)) {
      return kw;
    }
  }
  return null;
}
