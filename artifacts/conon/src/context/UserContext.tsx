import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "customer" | "vendor" | "admin" | null;

export interface UserProfile {
  name: string;
  role: string;   // human-readable role label, e.g. "Super Admin / Contractor"
  phone: string;
}

export interface ActiveUser {
  name: string;
  phone: string;
  role: UserRole;
  vendorStore: string | null;
}

interface LoginPayload {
  role: UserRole;          // app role used for routing/gating
  name: string;
  phone: string;
  displayRole?: string;    // human-readable label shown in the UI
  vendorStore?: string | null; // set for vendor logins, links to their store
}

interface UserContextType {
  role: UserRole;
  phone: string;
  name: string;
  displayRole: string;
  vendorStore: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile;
  user: ActiveUser;
  setRole: (r: UserRole) => void;
  setPhone: (p: string) => void;
  setName: (n: string) => void;
  setDisplayRole: (d: string) => void;
  loginUser: (payload: LoginPayload) => void;
  logout: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  customer: "Builder / Owner",
  vendor: "Supplier / Vendor",
  admin: "Admin",
};

const UserContext = createContext<UserContextType>({
  role: null, phone: "", name: "", displayRole: "", vendorStore: null, isAuthenticated: false,
  userProfile: { name: "", role: "", phone: "" },
  user: { name: "", phone: "", role: null, vendorStore: null },
  setRole: () => {}, setPhone: () => {}, setName: () => {}, setDisplayRole: () => {},
  loginUser: () => {}, logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState]   = useState<UserRole>(() => (localStorage.getItem("conon_role") as UserRole) ?? null);
  const [phone, setPhoneState] = useState(() => localStorage.getItem("conon_phone") ?? "");
  const [name, setNameState]   = useState(() => localStorage.getItem("conon_name") ?? "");
  const [displayRole, setDisplayRoleState] = useState(() => localStorage.getItem("conon_display_role") ?? "");
  const [vendorStore, setVendorStoreState] = useState<string | null>(() => localStorage.getItem("conon_vendor_store") || null);

  const setRole  = (r: UserRole) => { setRoleState(r); localStorage.setItem("conon_role", r ?? ""); };
  const setPhone = (p: string)   => { setPhoneState(p); localStorage.setItem("conon_phone", p); };
  const setName  = (n: string)   => { setNameState(n);  localStorage.setItem("conon_name", n); };
  const setDisplayRole = (d: string) => { setDisplayRoleState(d); localStorage.setItem("conon_display_role", d); };
  const setVendorStore = (s: string | null) => {
    setVendorStoreState(s);
    if (s) localStorage.setItem("conon_vendor_store", s);
    else localStorage.removeItem("conon_vendor_store");
  };

  const loginUser = (payload: LoginPayload) => {
    setRole(payload.role);
    setName(payload.name);
    setPhone(payload.phone);
    setDisplayRole(payload.displayRole ?? (payload.role ? ROLE_LABELS[payload.role] ?? "" : ""));
    setVendorStore(payload.vendorStore ?? null);
  };

  const logout   = () => {
    setRoleState(null); setPhoneState(""); setNameState(""); setDisplayRoleState(""); setVendorStoreState(null);
    localStorage.removeItem("conon_role");
    localStorage.removeItem("conon_phone");
    localStorage.removeItem("conon_name");
    localStorage.removeItem("conon_display_role");
    localStorage.removeItem("conon_vendor_store");
    localStorage.removeItem("conon_jwt");
  };

  const isAuthenticated = role !== null;
  const resolvedDisplayRole = displayRole || (role ? ROLE_LABELS[role] ?? "" : "");
  const userProfile: UserProfile = { name, role: resolvedDisplayRole, phone };
  const user: ActiveUser = { name, phone, role, vendorStore };

  return (
    <UserContext.Provider value={{
      role, phone, name, displayRole: resolvedDisplayRole, vendorStore, isAuthenticated, userProfile, user,
      setRole, setPhone, setName, setDisplayRole, loginUser, logout,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
