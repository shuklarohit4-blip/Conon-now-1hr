export const IS_LOCAL_ADMIN =
  import.meta.env.VITE_LOCAL_ADMIN === "true";

export const MAC_ADMIN_KEY =
  IS_LOCAL_ADMIN ? (import.meta.env.VITE_MAC_ADMIN_KEY || "") : "";
