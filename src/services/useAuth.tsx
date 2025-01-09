import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

// hooks/useAuth.tsx
export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !user) {
        router.replace('/');
      }
    }, [user, loading]);
  
    return { user, loading };
  }