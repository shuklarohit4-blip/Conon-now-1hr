/**
 * MSG91 OTP widget loader.
 *
 * Loads the hosted OTP widget script once, then opens it on demand. The widget
 * runs the whole send → verify OTP lifecycle and hands back a short-lived JWT
 * "access-token", which we forward to the api-server for server-side validation.
 *
 * Configuration comes from build-time env (never hard-coded):
 *   VITE_MSG91_WIDGET_ID  – public widget id
 *   VITE_MSG91_TOKEN_AUTH – widget auth token (client-side by design)
 */

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID as string | undefined;
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH as string | undefined;

const SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];

type InitSendOTP = (config: Record<string, unknown>) => void;

declare global {
  interface Window {
    initSendOTP?: InitSendOTP;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadWidgetScript(): Promise<void> {
  if (typeof window !== "undefined" && typeof window.initSendOTP === "function") {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    let i = 0;
    const tryNext = () => {
      if (i >= SCRIPT_URLS.length) {
        scriptPromise = null;
        reject(new Error("Could not load the OTP service."));
        return;
      }
      const s = document.createElement("script");
      s.src = SCRIPT_URLS[i];
      s.async = true;
      s.onload = () => {
        if (typeof window.initSendOTP === "function") resolve();
        else {
          i += 1;
          tryNext();
        }
      };
      s.onerror = () => {
        i += 1;
        tryNext();
      };
      document.head.appendChild(s);
    };
    tryNext();
  });
  return scriptPromise;
}

export function isMsg91Configured(): boolean {
  return Boolean(WIDGET_ID && TOKEN_AUTH);
}

function extractAccessToken(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const token = d["access-token"] ?? d["accessToken"] ?? d["message"];
    if (typeof token === "string") return token;
  }
  return "";
}

export interface LaunchOtpOptions {
  /** 10-digit Indian mobile to pre-fill in the widget (optional). */
  phone?: string;
}

/** Opens the MSG91 OTP widget and resolves with the verified access-token. */
export function launchOtpWidget(opts: LaunchOtpOptions = {}): Promise<string> {
  if (!isMsg91Configured()) {
    return Promise.reject(new Error("OTP login isn't configured yet."));
  }
  return loadWidgetScript().then(
    () =>
      new Promise<string>((resolve, reject) => {
        let settled = false;
        const identifier = opts.phone ? `91${opts.phone}` : undefined;
        const configuration: Record<string, unknown> = {
          widgetId: WIDGET_ID,
          tokenAuth: TOKEN_AUTH,
          ...(identifier ? { identifier } : {}),
          success: (data: unknown) => {
            if (settled) return;
            settled = true;
            const token = extractAccessToken(data);
            if (token) resolve(token);
            else reject(new Error("OTP verification didn't return a token."));
          },
          failure: (err: unknown) => {
            if (settled) return;
            settled = true;
            const msg =
              typeof err === "string"
                ? err
                : (err as { message?: string })?.message ??
                  "OTP verification was cancelled.";
            reject(new Error(msg));
          },
        };
        try {
          window.initSendOTP!(configuration);
        } catch {
          if (!settled) {
            settled = true;
            reject(new Error("Couldn't open the OTP widget."));
          }
        }
      }),
  );
}
