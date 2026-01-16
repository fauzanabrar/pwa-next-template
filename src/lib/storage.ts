const isBrowser = () => typeof window !== "undefined";

export const storage = {
  readJSON<T>(key: string): T | null {
    if (!isBrowser()) {
      return null;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  writeJSON<T>(key: string, value: T) {
    if (!isBrowser()) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  readString(key: string): string | null {
    if (!isBrowser()) {
      return null;
    }
    return window.localStorage.getItem(key);
  },
  writeString(key: string, value: string) {
    if (!isBrowser()) {
      return;
    }
    window.localStorage.setItem(key, value);
  },
  readSession(key: string): string | null {
    if (!isBrowser()) {
      return null;
    }
    return window.sessionStorage.getItem(key);
  },
  writeSession(key: string, value: string) {
    if (!isBrowser()) {
      return;
    }
    window.sessionStorage.setItem(key, value);
  },
};
