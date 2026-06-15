"use client";

const TOKEN_KEY = "prontera_access_token";
const USER_KEY = "prontera_auth_user";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  preferredLocale?: string | null;
  preferredCurrency?: string | null;
  countryCode?: string | null;
  timezone?: string | null;
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, user?: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
