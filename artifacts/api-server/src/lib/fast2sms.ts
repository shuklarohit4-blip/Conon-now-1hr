import crypto from "crypto";
import { logger } from "./logger";

const FAST2SMS_BULK_V2_URL = "https://www.fast2sms.com/dev/bulkV2";
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds resend cooldown
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_OTPS_PER_DAY = 5;

interface OtpChallenge {
  salt: string;
  hash: string;
  expiresAt: number;
  issuedAt: number;
  attempts: number;
  devFallback: boolean;
}

interface DailyQuotaEntry {
  dateKey: string;
  count: number;
}

const otpStore = new Map<string, OtpChallenge>();
const dailyQuotaStore = new Map<string, DailyQuotaEntry>();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (entry.expiresAt <= now) otpStore.delete(phone);
  }
}, 60_000);
cleanupTimer.unref?.();

function hashOtp(otp: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

function getCandidateApiKeys(): string[] {
  const raw = String(process.env.FAST2SMS_API_KEY || "").trim();
  if (!raw) return [];
  const keys = [raw];
  if (/^fast2sms-/i.test(raw)) {
    const stripped = raw.replace(/^fast2sms-/i, "").trim();
    if (stripped) keys.push(stripped);
  }
  return keys;
}

async function sendWhatsAppCloudOtp(
  phone: string,
  otp: string
): Promise<{ ok: boolean; error?: string }> {
  const waToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.WHATSAPP_TOKEN || "").trim();
  const waPhoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  if (!waToken || !waPhoneNumberId) {
    return { ok: false, error: "WhatsApp Cloud API not configured." };
  }
  const templateName = (process.env.WHATSAPP_OTP_TEMPLATE || "conon_otp_login").trim();
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(waPhoneNumberId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${phone}`,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: otp }],
              },
            ],
          },
        }),
      }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, error: txt || `WhatsApp HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "WhatsApp Cloud API error" };
  }
}

async function callFast2Sms(
  apiKey: string,
  payload: Record<string, string>
): Promise<{ ok: boolean; status: number; message: string; data?: any }> {
  const res = await fetch(FAST2SMS_BULK_V2_URL, {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => null)) as { return?: boolean; message?: string | string[] } | null;
  const returnedTrue = data?.return === true;
  const msg = Array.isArray(data?.message)
    ? data.message.join("; ")
    : String(data?.message || res.statusText || "Fast2SMS error");
  return { ok: res.ok && returnedTrue, status: res.status, message: msg, data };
}

export async function sendFast2SmsOtp(
  rawPhone: string,
  channel: "whatsapp" | "sms" | "auto" = "auto"
): Promise<{
  ok: boolean;
  phone: string;
  provider: "whatsapp" | "fast2sms" | "dev-fallback";
  expiresInSeconds: number;
  cooldownSeconds?: number;
  message: string;
  devOtp?: string;
  error?: string;
}> {
  const phone = rawPhone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return {
      ok: false,
      phone,
      provider: "fast2sms",
      expiresInSeconds: 0,
      message: "Enter a valid 10-digit Indian mobile number.",
      error: "Invalid Indian mobile number.",
    };
  }

  const now = Date.now();
  const todayKey = new Date(now).toISOString().slice(0, 10);
  const quota = dailyQuotaStore.get(phone);
  if (quota && quota.dateKey === todayKey && quota.count >= MAX_OTPS_PER_DAY) {
    return {
      ok: false,
      phone,
      provider: "fast2sms",
      expiresInSeconds: 0,
      message: `Daily OTP limit (${MAX_OTPS_PER_DAY}/day) reached for +91 ${phone}.`,
      error: "Daily OTP limit exceeded.",
    };
  }

  const existing = otpStore.get(phone);
  if (existing && now - existing.issuedAt < RESEND_COOLDOWN_MS && existing.expiresAt > now) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.issuedAt)) / 1000);
    return {
      ok: false,
      phone,
      provider: "fast2sms",
      expiresInSeconds: Math.ceil((existing.expiresAt - now) / 1000),
      cooldownSeconds: waitSec,
      message: `Please wait ${waitSec}s before requesting another OTP.`,
      error: `Please wait ${waitSec}s before requesting another OTP.`,
    };
  }

  const bumpDailyQuota = () => {
    const cur = dailyQuotaStore.get(phone);
    if (!cur || cur.dateKey !== todayKey) {
      dailyQuotaStore.set(phone, { dateKey: todayKey, count: 1 });
    } else {
      cur.count += 1;
    }
  };

  const keys = getCandidateApiKeys();
  const waConfigured = Boolean(
    (process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.WHATSAPP_TOKEN || "").trim() &&
      (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim()
  );
  const isProd = process.env.NODE_ENV === "production";
  const otp =
    !waConfigured && keys.length === 0 && !isProd
      ? "123456"
      : String(crypto.randomInt(100000, 1000000));
  const salt = crypto.randomBytes(8).toString("hex");
  const hash = hashOtp(otp, salt);

  // 1. Primary Provider: WhatsApp Cloud API
  if ((channel === "auto" || channel === "whatsapp") && waConfigured) {
    const waResult = await sendWhatsAppCloudOtp(phone, otp);
    if (waResult.ok) {
      otpStore.set(phone, {
        salt,
        hash,
        expiresAt: now + OTP_TTL_MS,
        issuedAt: now,
        attempts: 0,
        devFallback: false,
      });
      bumpDailyQuota();
      logger.info({ phone }, "[WhatsApp Cloud API] OTP sent");
      return {
        ok: true,
        phone,
        provider: "whatsapp",
        expiresInSeconds: OTP_TTL_MS / 1000,
        cooldownSeconds: RESEND_COOLDOWN_MS / 1000,
        message: `OTP sent via WhatsApp to +91 ${phone}.`,
      };
    }
    logger.warn({ phone, err: waResult.error }, "[WhatsApp Cloud API] Fallback to SMS");
  }

  // 2. Fallback Provider: Fast2SMS
  if (keys.length > 0 && channel !== "whatsapp") {
    const dltSender = (process.env.FAST2SMS_DLT_SENDER_ID || "").trim();
    const dltMessage = (process.env.FAST2SMS_DLT_MESSAGE_ID || "").trim();

    const candidatePayloads: Record<string, string>[] = [];
    if (dltSender && dltMessage) {
      candidatePayloads.push({
        route: "dlt",
        sender_id: dltSender,
        message: dltMessage,
        variables_values: otp,
        numbers: phone,
      });
    }
    candidatePayloads.push({
      route: "otp",
      variables_values: otp,
      numbers: phone,
    });
    candidatePayloads.push({
      route: "q",
      message: `Your CONON-NOW verification OTP is ${otp}. Valid for 5 minutes.`,
      language: "english",
      numbers: phone,
    });

    for (const key of keys) {
      for (const payload of candidatePayloads) {
        try {
          const res = await callFast2Sms(key, payload);
          if (res.ok) {
            otpStore.set(phone, {
              salt,
              hash,
              expiresAt: now + OTP_TTL_MS,
              issuedAt: now,
              attempts: 0,
              devFallback: false,
            });
            bumpDailyQuota();
            logger.info({ phone, route: payload.route }, "[Fast2SMS] OTP SMS dispatched");
            return {
              ok: true,
              phone,
              provider: "fast2sms",
              expiresInSeconds: OTP_TTL_MS / 1000,
              cooldownSeconds: RESEND_COOLDOWN_MS / 1000,
              message: `OTP sent via SMS to +91 ${phone}.`,
            };
          }
          if (res.status === 401 || /invalid auth/i.test(res.message)) {
            break;
          }
        } catch {
          // Continue fallback
        }
      }
    }
  }

  // 3. Local Dev Test OTP ("123456") when provider keys aren't configured
  if (!isProd) {
    const devCode = "123456";
    const devHash = hashOtp(devCode, salt);
    otpStore.set(phone, {
      salt,
      hash: devHash,
      expiresAt: now + OTP_TTL_MS,
      issuedAt: now,
      attempts: 0,
      devFallback: true,
    });
    bumpDailyQuota();
    logger.info({ phone, otp: devCode }, "[OTP Dev Fallback] Provider keys absent — active Dev OTP 123456");
    return {
      ok: true,
      phone,
      provider: "dev-fallback",
      expiresInSeconds: OTP_TTL_MS / 1000,
      cooldownSeconds: RESEND_COOLDOWN_MS / 1000,
      message: `Dev Test OTP ready for +91 ${phone} (Use 123456)`,
      devOtp: devCode,
    };
  }

  return {
    ok: false,
    phone,
    provider: "fast2sms",
    expiresInSeconds: 0,
    message: "OTP service is not configured on the server.",
    error: "OTP provider credentials missing.",
  };
}

export function verifyFast2SmsOtp(rawPhone: string, rawOtp: string): {
  ok: boolean;
  phone: string;
  error?: string;
} {
  const phone = rawPhone.replace(/\D/g, "").slice(-10);
  const otp = String(rawOtp || "").trim();

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { ok: false, phone, error: "Invalid mobile number." };
  }
  if (!/^\d{4,6}$/.test(otp)) {
    return { ok: false, phone, error: "Enter the 6-digit OTP sent to your phone." };
  }

  const record = otpStore.get(phone);
  if (!record) {
    // Allow Dev Test OTP ("123456") in non-production environments when no external provider key is active
    const isProd = process.env.NODE_ENV === "production";
    const hasProvider = Boolean(
      process.env.FAST2SMS_API_KEY?.trim() || process.env.WHATSAPP_TOKEN?.trim()
    );
    if (!isProd && !hasProvider && otp === "123456") {
      return { ok: true, phone };
    }
    return { ok: false, phone, error: "OTP not found or already used. Please request a new OTP." };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { ok: false, phone, error: "OTP has expired. Please request a new OTP." };
  }

  record.attempts += 1;
  if (record.attempts > MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(phone);
    return { ok: false, phone, error: "Too many wrong OTP attempts. Please request a new OTP." };
  }

  const candidateHash = hashOtp(otp, record.salt);
  const ab = Buffer.from(candidateHash, "hex");
  const bb = Buffer.from(record.hash, "hex");
  const valid =
    (ab.length === bb.length && crypto.timingSafeEqual(ab, bb)) ||
    (record.devFallback && otp === "123456");

  if (!valid) {
    return { ok: false, phone, error: "Incorrect OTP. Please try again." };
  }

  otpStore.delete(phone);
  return { ok: true, phone };
}
