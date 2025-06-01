import api from "@/scripts/api";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react"

export default function makeRequesters() {
    const { data: session, status } = useSession();
    const [token, setToken] = useState<string | null>(null);
    const waiters = useRef<(() => void)[]>([]);
  
    // Resolve pending promises once the token is ready
    useEffect(() => {
      if (status === "authenticated" && session?.jwt?.accessToken) {
        setToken(session.jwt.accessToken);
        waiters.current.forEach((resolve) => resolve());
        waiters.current = [];
      }
    }, [status, session]);
  
    const waitUntilReady = () =>
      new Promise<void>((resolve) => {
        if (token) {
          resolve();
        } else {
          waiters.current.push(resolve);
        }
      });
  
    const backendGet = async (path: string) => {
      await waitUntilReady();
      return api.get(path, { headers: { token } });
    };
  
    const backendPost = async (path: string, body: Object) => {
      await waitUntilReady();
      return api.post(path, body, { headers: { token } });
    };
  
    return { backendGet, backendPost };
  }