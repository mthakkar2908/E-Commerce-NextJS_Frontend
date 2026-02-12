/* eslint-disable @typescript-eslint/no-explicit-any */
const KEY = "app_session_v1";


export function saveSession(data: any) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getSession(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return console.error(e) ?? null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch (e) {
    console.error(e);
  }
}
