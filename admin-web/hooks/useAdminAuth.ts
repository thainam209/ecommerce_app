// hooks/useAdminAuth.ts
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "expo-router";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type Options = {
  /**
   * Có tự động redirect về màn login khi không phải admin không?
   *  - true: dùng cho các màn cần bảo vệ (dashboard, manage, orders...)
   *  - false: dùng cho màn login để tránh loop
   */
  redirectToLogin?: boolean;
};

// Wrapper localStorage cho web
const storage = {
  async setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  async getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  async removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export function useAdminAuth(options?: Options) {
  const router = useRouter();
  const pathname = usePathname();

  const redirectToLogin = options?.redirectToLogin ?? true;

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Lần đầu mount: đọc token & user từ storage
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const savedToken = await storage.getItem("token");
        const savedUser = await storage.getItem("user");

        if (!isMounted) return;

        if (savedToken && savedUser) {
          setToken(savedToken);
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAdmin = !!user && user.role === "admin";

  // Hàm login: dùng cho màn /index
  async function login(nextToken: string, nextUser: AuthUser) {
    await storage.setItem("token", nextToken);
    await storage.setItem("user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  // Hàm logout: xóa token + quay về login
  async function logout() {
    await storage.removeItem("token");
    await storage.removeItem("user");
    setToken(null);
    setUser(null);
    // Quay về màn login
    router.replace("/(tabs)");
  }

  // Tự động redirect về login cho các màn bảo vệ
  useEffect(() => {
    if (!redirectToLogin) return;
    if (loading) return;

    if (!token || !isAdmin) {
      // Chỉ redirect khi không phải đang ở màn login
      if (pathname !== "/(tabs)" && pathname !== "/(tabs)/") {
        router.replace("/(tabs)");
      }
    }
  }, [redirectToLogin, loading, token, isAdmin, pathname, router]);

  return { token, user, isAdmin, loading, login, logout };
}
