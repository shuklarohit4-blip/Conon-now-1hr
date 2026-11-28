import type { CanonicalOrderStatus } from "./orders";

export interface CononApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
}

export interface ApiHealthResponse {
  status: string;
  postgres: "connected" | "error";
  mongo: "connected" | "error";
  mode: "live" | "fallback";
  timestamp?: string;
}

export function createCononApiClient(opts: CononApiClientOptions) {
  const cleanBase = opts.baseUrl.replace(/\/+$/, "");

  async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const token = opts.getToken ? await opts.getToken() : null;
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
    };
    if (!(init.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${cleanBase}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers,
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    }
    return data as T;
  }

  return {
    getHealth: () => request<ApiHealthResponse>("/api/health"),
    getCatalog: (params?: { category?: string; search?: string; hubCode?: string }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set("category", params.category);
      if (params?.search) qs.set("search", params.search);
      if (params?.hubCode) qs.set("hubCode", params.hubCode);
      const q = qs.toString();
      return request(`/api/catalog${q ? `?${q}` : ""}`);
    },
    sendCustomerOtp: (phone: string, channel: "whatsapp" | "sms" | "auto" = "auto") =>
      request("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ phone, channel }),
      }),
    verifyCustomerOtp: (phone: string, otp: string, role?: string) =>
      request("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, otp, role }),
      }),
    adminLogin: (identifier: string, pin: string | number, rbacRole?: string) =>
      request("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email: identifier, password: String(pin), rbacRole }),
      }),
    placeOrder: (payload: {
      customerPhone: string;
      hubCode?: string;
      orderType?: "buy" | "rent" | "kit" | "bulk";
      paymentMode?: string;
      deliveryAddress?: string;
      pincode?: string;
      items: Array<{ skuCode: string; titleSnapshot?: string; qty: number; unitPrice?: number; variantJson?: Record<string, any> }>;
    }) =>
      request("/api/hybrid/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    listOrders: () => request("/api/orders"),
    updateOrderStatus: (orderId: string, status: CanonicalOrderStatus, meta?: Record<string, any>) =>
      request(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...meta }),
      }),
    deliverOrder: (orderId: string, deliveryOtp: string, driverPhone?: string, proofPhotoUrl?: string) =>
      request(`/api/orders/${encodeURIComponent(orderId)}/deliver`, {
        method: "PATCH",
        body: JSON.stringify({ deliveryOtp, driverPhone, proofPhotoUrl }),
      }),
    submitLead: (payload: {
      leadType: "SOLAR_MVVNL" | "PARCHA_BOQ" | "TURNKEY_SERVICE";
      customerName: string;
      phone: string;
      locality: string;
      payload?: Record<string, any>;
    }) =>
      request("/api/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    listLeads: (leadType?: string) =>
      request(`/api/leads${leadType ? `?leadType=${encodeURIComponent(leadType)}` : ""}`),
    upsertAdminSku: (payload: Record<string, any>) =>
      request("/api/admin/hybrid/sku", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getAdminSnapshot: () => request("/api/admin/hybrid/snapshot"),
  };
}
