import api from "@/scripts/api";
import { useSession } from "next-auth/react";
import { useRef, useEffect } from "react";
import { AxiosResponse } from "axios";

// export type Requesters = [
//   (path: string, noAuth?: boolean) => Promise<AxiosResponse<any, any>>, 
//   (path: string, body: Object) => Promise<AxiosResponse<any, any>>,
// ];

export interface Requesters {
  backendGet: (path: string, noAuth?: boolean) => Promise<AxiosResponse<any, any>>,
  backendPost: (path: string, body: Object) => Promise<AxiosResponse<any, any>>,
  sessionStatus: () => Promise<AuthStat>,
}

export enum AuthStat { Auth = "authenticated", Unauth = "unauthenticated" }

export function makeRequesters() {
  const { data: session, status } = useSession();
  const waiters = useRef<((token: string) => void)[]>([]);
  const loadWaiters = useRef<((stat: AuthStat) => void)[]>([]);

  // When session becomes ready, resolve any pending calls
  useEffect(() => {
    if (status !== "loading") {
      loadWaiters.current.forEach((resolve)=>resolve(status as AuthStat));
      loadWaiters.current = [];
    }
    const token = session?.jwt?.accessToken;
    if (status === "authenticated" && token) {
      waiters.current.forEach((resolve) => resolve(token));
      waiters.current = [];
    }
  }, [status, session]);

  const waitUntilReady = () =>
    new Promise<string>((resolve) => {
      const token = session?.jwt?.accessToken;
      if (status === "authenticated" && token) {
        resolve(token);
      } else {
        waiters.current.push(resolve);
      }
    });

  const waitUntilLoaded = () =>
    new Promise<AuthStat>((resolve) => {
      if (status !== "loading") {
        resolve(status as AuthStat)
      } else {
        loadWaiters.current.push(resolve);
      }
    });

  const sessionStatus = async () => {
    return await waitUntilLoaded();
  }

  const backendGet = async (path: string, noAuth: boolean = false) => {
    if (noAuth) {
      return api.get(path)
    } else {
      const token = await waitUntilReady();
      if (!token) throw new Error("Token non-truthy - requests has a bug :(")
      return api.get(path, { headers: { token } });
    }
  };

  const backendPost = async (path: string, body: Object) => {
    const token = await waitUntilReady();
    if (!token) throw new Error("Token non-truthy - requests has a bug :(")
    return api.post(path, body, { headers: { token } });
  };

  return { backendGet, backendPost, sessionStatus };
}