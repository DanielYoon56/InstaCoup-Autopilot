export interface TokenDiagnosticResult {
  valid: boolean;
  tokenType: 'PAGE' | 'USER' | 'UNKNOWN';
  isLiveMode: 'LIVE' | 'SANDBOX' | 'UNKNOWN';
  appId?: string;
  pageId?: string;
  pageName?: string;
  instagramAccountId?: string;
  instagramUsername?: string;
  scopes: string[];
  missingRequiredScopes: string[];
  expiresAt?: string;
  isExpired: boolean;
  message: string;
  officialConnectionActive: boolean; // Always false for diagnostic test unless live env verified
}

export interface VerifyTokenOptions {
  token: string;
  appId?: string;
  appSecret?: string;
  graphApiVersion?: string;
  fetchFn?: typeof fetch;
}

/**
 * Diagnostic verification of a Meta Access Token.
 * STRICT SECURITY PRINCIPLES:
 * 1. Token is evaluated in-memory only; never written to disk, localStorage, or server state.
 * 2. Never logs the URL or query containing the input token.
 * 3. Does not fabricate verified permissions; unverified scopes are marked as UNKNOWN/MISSING.
 * 4. Token validation success does NOT indicate official connection or active auto-DM dispatch.
 */
export async function verifyMetaTokenDiagnostic(
  options: VerifyTokenOptions
): Promise<TokenDiagnosticResult> {
  const {
    token,
    appId,
    appSecret,
    graphApiVersion = 'v26.0',
    fetchFn = globalThis.fetch,
  } = options;

  const cleanToken = token.trim();
  const REQUIRED_SCOPES = ['pages_messaging', 'instagram_manage_comments'];

  if (!cleanToken) {
    return {
      valid: false,
      tokenType: 'UNKNOWN',
      isLiveMode: 'UNKNOWN',
      scopes: [],
      missingRequiredScopes: REQUIRED_SCOPES,
      isExpired: false,
      message: '토큰 문자열이 비어 있습니다.',
      officialConnectionActive: false,
    };
  }

  try {
    let tokenType: 'PAGE' | 'USER' | 'UNKNOWN' = 'UNKNOWN';
    let scopesFound: string[] = [];
    let tokenAppId: string | undefined = undefined;
    let expiresAtIso: string | undefined = undefined;
    let isExpired = false;

    // 1. If App ID & Secret are configured, use the official /debug_token endpoint
    if (appId && appSecret) {
      const appAccessToken = `${appId.trim()}|${appSecret.trim()}`;
      // Note: We use URLSearchParams to construct the URL safely without logging it.
      const debugUrl = new URL(`https://graph.facebook.com/${graphApiVersion}/debug_token`);
      debugUrl.searchParams.set('input_token', cleanToken);
      debugUrl.searchParams.set('access_token', appAccessToken);

      const debugRes = await fetchFn(debugUrl.toString(), { method: 'GET' });
      if (debugRes.ok) {
        const debugData = (await debugRes.json()) as any;
        const d = debugData?.data;
        if (d) {
          if (!d.is_valid) {
            return {
              valid: false,
              tokenType: 'UNKNOWN',
              isLiveMode: 'UNKNOWN',
              scopes: [],
              missingRequiredScopes: REQUIRED_SCOPES,
              isExpired: true,
              message: `토큰이 유효하지 않거나 만료되었습니다 (${d.error?.message || 'Invalid Token'}).`,
              officialConnectionActive: false,
            };
          }

          tokenType = d.type === 'PAGE' ? 'PAGE' : d.type === 'USER' ? 'USER' : 'UNKNOWN';
          tokenAppId = d.app_id;
          scopesFound = Array.isArray(d.scopes) ? d.scopes : [];

          if (d.expires_at === 0) {
            expiresAtIso = 'Never (Never-expiring Page Token)';
          } else if (d.expires_at) {
            const expDate = new Date(d.expires_at * 1000);
            expiresAtIso = expDate.toISOString();
            isExpired = expDate.getTime() < Date.now();
          }
        }
      }
    }

    // 2. Query /me to discover Facebook Page & linked Instagram Business Account
    const meUrl = new URL(`https://graph.facebook.com/${graphApiVersion}/me`);
    meUrl.searchParams.set('fields', 'id,name,instagram_business_account{id,username}');
    meUrl.searchParams.set('access_token', cleanToken);

    const meRes = await fetchFn(meUrl.toString(), { method: 'GET' });

    if (!meRes.ok) {
      const errJson = (await meRes.json().catch(() => ({}))) as any;
      const errMsg = errJson?.error?.message || `HTTP ${meRes.status}`;
      return {
        valid: false,
        tokenType,
        isLiveMode: 'UNKNOWN',
        scopes: scopesFound,
        missingRequiredScopes: REQUIRED_SCOPES,
        isExpired,
        message: `Meta API 인증 실패: ${errMsg}`,
        officialConnectionActive: false,
      };
    }

    const meData = (await meRes.json()) as any;
    const pageId = meData.id;
    const pageName = meData.name;
    const igAccount = meData.instagram_business_account;
    const instagramAccountId = igAccount?.id;
    const instagramUsername = igAccount?.username;

    const missingScopes = REQUIRED_SCOPES.filter((req) => !scopesFound.includes(req));

    let advisory = '토큰 진단이 완료되었습니다.';
    if (tokenType === 'USER') {
      advisory +=
        ' [경고: 유저 토큰이 입력되었습니다. Instagram Messaging Private Replies는 반드시 페이스북 페이지 액세스 토큰(Page Access Token)이 필요합니다.]';
    }
    if (!instagramAccountId) {
      advisory +=
        ' [주의: 해당 페이스북 페이지에 연결된 Instagram 비즈니스/프로페셔널 계정이 발견되지 않았습니다. 메타 비즈니스 관리자에서 인스타그램 연결을 확인하세요.]';
    }

    return {
      valid: true,
      tokenType,
      isLiveMode: 'UNKNOWN', // Live mode approval cannot be inferred merely from token inspection
      appId: tokenAppId,
      pageId,
      pageName,
      instagramAccountId,
      instagramUsername,
      scopes: scopesFound,
      missingRequiredScopes: missingScopes,
      expiresAt: expiresAtIso,
      isExpired,
      message: advisory,
      officialConnectionActive: false, // Testing a token in UI does NOT activate server background dispatch
    };
  } catch (err: any) {
    return {
      valid: false,
      tokenType: 'UNKNOWN',
      isLiveMode: 'UNKNOWN',
      scopes: [],
      missingRequiredScopes: REQUIRED_SCOPES,
      isExpired: false,
      message: `진단 통신 오류: ${err.message || '네트워크 장애'}`,
      officialConnectionActive: false,
    };
  }
}
