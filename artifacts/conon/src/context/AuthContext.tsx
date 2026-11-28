import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { adminLogin, customerLogin, verifyOtp, CUSTOMER_JWT_KEY, JWT_STORAGE_KEY, ADMIN_JWT_KEY } from "@/lib/authApi";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";
import { apiUrl } from "@/lib/apiBase";

export interface AuthUser {
  id?: string;
  name: string;
  phone: string;
  role: string; // 'customer' | 'ADMIN' | 'vendor' | 'driver'
  displayRole?: string;
  pinCode?: string;
  email?: string | null;
  profileImageUrl?: string | null;
  token?: string;
  adminPermission?: "SUPER_ADMIN" | "DISPATCH_MANAGER" | "ACCOUNTS_CONTROL";
}

export type AuthModalTab = "login" | "signup" | "admin";

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  loginWithOtp: (payload: {
    phone: string;
    otp: string;
    name?: string;
    role?: string;
    pinCode?: string;
  }) => Promise<void>;
  createAccount: (payload: {
    name: string;
    phone: string;
    pinCode?: string;
    role: string;
  }) => Promise<void>;
  loginAsAdmin: (payload: {
    adminId: string;
    pin: string;
    permissionRole: "SUPER_ADMIN" | "DISPATCH_MANAGER" | "ACCOUNTS_CONTROL";
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = "conon_auth_user";

const ALL_AUTH_STORAGE_KEYS = [
  AUTH_STORAGE_KEY,
  CUSTOMER_JWT_KEY,
  JWT_STORAGE_KEY,
  ADMIN_JWT_KEY,
  "conon_admin_role",
  "conon_admin_jwt",
  "conon_admin_permission",
  "conon_customer_role",
  "conon_customer_phone",
  "conon_customer_name",
  "conon_customer_display_role",
  "conon_customer_jwt",
  "conon_role",
  "conon_phone",
  "conon_name",
  "conon_display_role",
  "conon_jwt",
  "jwt",
  "token",
  "user",
  "role",
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize ONLY from explicit saved session in localStorage, NO default mock users
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && (parsed.phone || parsed.role === "ADMIN")) {
          return parsed as AuthUser;
        }
      }
    } catch (_) {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>("login");

  const openAuthModal = useCallback((tab: AuthModalTab = "login") => {
    if (tab === "admin" && !IS_LOCAL_ADMIN) {
      setAuthModalTab("login");
    } else {
      setAuthModalTab(tab);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Global Stealth Keyboard Shortcut: Cmd + Shift + A (macOS) / Ctrl + Shift + A (Windows)
  // Gated strictly behind IS_LOCAL_ADMIN so it NEVER runs in public/Netlify production builds
  useEffect(() => {
    if (!IS_LOCAL_ADMIN) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        openAuthModal("admin");
        toast.info("🔒 Founder / Admin Command Portal Activated", {
          description: "Enter Founder PIN to unlock Command OS",
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openAuthModal]);

  const persistUserSession = (userData: AuthUser) => {
    setUser(userData);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      if (userData.token) {
        if (userData.role === "ADMIN") {
          localStorage.setItem(ADMIN_JWT_KEY, userData.token);
          localStorage.setItem("conon_admin_jwt", userData.token);
          localStorage.setItem("conon_admin_role", userData.adminPermission || "SUPER_ADMIN");
        } else {
          localStorage.setItem(CUSTOMER_JWT_KEY, userData.token);
          localStorage.setItem(JWT_STORAGE_KEY, userData.token);
          localStorage.setItem("conon_jwt", userData.token);
        }
      }
      localStorage.setItem("conon_customer_name", userData.name);
      localStorage.setItem("conon_name", userData.name);
      localStorage.setItem("conon_customer_phone", userData.phone || "");
      localStorage.setItem("conon_phone", userData.phone || "");
      localStorage.setItem("conon_role", userData.role === "ADMIN" ? "admin" : "customer");
      localStorage.setItem(
        "conon_customer_role",
        userData.role === "ADMIN" ? "admin" : "customer"
      );
      localStorage.setItem(
        "conon_customer_display_role",
        userData.displayRole || (userData.role === "ADMIN" ? "Super Admin (Founder)" : "Builder / Owner")
      );
      localStorage.setItem(
        "conon_display_role",
        userData.displayRole || (userData.role === "ADMIN" ? "Super Admin (Founder)" : "Builder / Owner")
      );
    } catch (_) {}
  };

  const clearAllSessions = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      for (const k of ALL_AUTH_STORAGE_KEYS) {
        try {
          localStorage.removeItem(k);
          sessionStorage.removeItem(k);
        } catch (_) {}
      }
    }
  };

  const loginWithOtp = useCallback(
    async (payload: {
      phone: string;
      otp: string;
      name?: string;
      role?: string;
      pinCode?: string;
    }) => {
      const cleanPhone = payload.phone.replace(/\D/g, "").slice(-10);
      const cleanOtp = payload.otp.trim();
      const resolvedRole = payload.role || "Builder / Owner";
      const resolvedName =
        payload.name?.trim() ||
        (resolvedRole.includes("Contractor") ? "Lucknow Contractor" : "CONON Builder");

      const res = await verifyOtp(cleanPhone, cleanOtp, {
        name: resolvedName,
        role: "customer",
      });
      if (!res.ok || !res.token) {
        throw new Error(res.error || "Invalid or expired OTP.");
      }

      const userData: AuthUser = {
        id: String(res.user?.id || `usr_${cleanPhone}`),
        name: res.user?.name || resolvedName,
        phone: res.user?.phone || cleanPhone,
        role: res.user?.role || "customer",
        displayRole: resolvedRole,
        pinCode: payload.pinCode || "226030",
        token: res.token,
      };

      persistUserSession(userData);
      setIsAuthModalOpen(false);
      toast.success(`Welcome to CONON-NOW, ${userData.name}!`);
    },
    []
  );

  const createAccount = useCallback(
    async (payload: {
      name: string;
      phone: string;
      pinCode?: string;
      role: string;
    }) => {
      const cleanPhone = payload.phone.replace(/\D/g, "");
      const resolvedName = payload.name.trim() || "CONON Builder";
      const resolvedRole = payload.role || "Home Owner";

      let token = "demo-customer-jwt";
      try {
        const res = await customerLogin({
          phone: cleanPhone,
          name: resolvedName,
        });
        if (res.ok && res.token) {
          token = res.token;
        }
      } catch (_) {
        // fallback
      }

      const userData: AuthUser = {
        id: `usr_${cleanPhone}_${Date.now()}`,
        name: resolvedName,
        phone: cleanPhone,
        role: "customer",
        displayRole: resolvedRole,
        pinCode: payload.pinCode || "226030",
        token,
      };

      persistUserSession(userData);
      setIsAuthModalOpen(false);
      toast.success(`Account created! Welcome, ${resolvedName}!`);
    },
    []
  );

  const loginAsAdmin = useCallback(
    async (payload: {
      adminId: string;
      pin: string;
      permissionRole: "SUPER_ADMIN" | "DISPATCH_MANAGER" | "ACCOUNTS_CONTROL";
    }) => {
      const email = payload.adminId.includes("@") ? payload.adminId.trim() : "admin@conon.in";
      const result = await adminLogin(email, payload.pin);
      if (!result.ok || !result.token) {
        throw new Error(result.error || "Invalid admin credentials.");
      }

      const roleLabels: Record<string, string> = {
        SUPER_ADMIN: "Super Admin (Founder)",
        DISPATCH_MANAGER: "Dispatch Manager",
        ACCOUNTS_CONTROL: "Accounts & Rate Control",
      };

      const resolvedName =
        payload.adminId === "admin" || payload.adminId.toLowerCase().includes("founder")
          ? "Founder & CEO"
          : payload.adminId;

      const adminUser: AuthUser = {
        id: "admin",
        name: resolvedName,
        phone: "",
        role: "ADMIN",
        displayRole: roleLabels[payload.permissionRole] || "Super Admin (Founder)",
        adminPermission: payload.permissionRole,
        email,
        token: result.token,
      };

      persistUserSession(adminUser);
      try {
        localStorage.setItem("conon_admin_role", payload.permissionRole);
      } catch {}
      setIsAuthModalOpen(false);
      toast.success(`Unlocked CONON COMMAND OS (${adminUser.displayRole})`);
    },
    []
  );

  const logout = useCallback(async () => {
    // 1. Immediately wipe local and session storage
    clearAllSessions();

    // 2. Safe Firebase sign out
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (_) {}

    // 3. Safe backend session clearance
    try {
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    // 4. Show success toast
    toast.success("Logged out successfully");

    // 5. Automatically open the Auth modal on the login tab
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  }, []);

  const isAdmin = Boolean(IS_LOCAL_ADMIN && (user?.role === "ADMIN" || user?.role === "admin"));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        loginWithOtp,
        createAccount,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
