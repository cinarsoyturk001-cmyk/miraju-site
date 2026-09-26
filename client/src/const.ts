import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

type AuthMode = "signIn" | "signUp";
export type SocialProvider = "google" | "apple";

function startOAuth(mode: AuthMode, provider?: SocialProvider) {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  if (!oauthPortalUrl || !appId) {
    console.error("[Miraju Auth] OAuth yapılandırması eksik: VITE_OAUTH_PORTAL_URL ve VITE_APP_ID gerekli.");
    window.alert("Kayıt sistemi henüz yapılandırılmadı. Site yöneticisi OAuth bağlantısını tamamladığında tekrar deneyebilirsiniz.");
    return;
  }
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", mode);
  if (provider) url.searchParams.set("provider", provider);
  window.location.href = url.toString();
}

export const startLogin = () => startOAuth("signIn");
export const startSignup = () => startOAuth("signUp");
export const startSocialLogin = (provider: SocialProvider) => startOAuth("signIn", provider);
