import api from "@/scripts/api";
import { useSession } from "next-auth/react";
import { useRef, useEffect, useCallback, useMemo } from "react";
import { AxiosResponse } from "axios";

export interface Requesters {
  backendGet: (path: string, noAuth?: boolean) => Promise<AxiosResponse<any, any>>,
  backendPost: (path: string, body: Object) => Promise<AxiosResponse<any, any>>,
  sessionStatus: () => Promise<AuthStat>,
}

export enum AuthStat { Auth = "authenticated", Unauth = "unauthenticated" }

//Thrown when an authenticated request is made without a session. Carries status 401 so
//that call sites can branch on err.status exactly as they do for a real backend 401.
export class NotAuthenticatedError extends Error {
  readonly status = 401;
  constructor() {
    super("Not signed in - this request requires an authenticated user");
    this.name = "NotAuthenticatedError";
  }
}

/**
 * Hook providing authenticated access to the backend.
 *
 * The returned functions are memoized on the session, so their identities stay stable
 * across renders. That matters: they are safe to put in a useEffect dependency array
 * only because of this - an unmemoized function would compare unequal every render and
 * re-run the effect forever.
 */
export function useRequesters(): Requesters {
  const { data: session, status } = useSession();
  const waiters = useRef<{ resolve: (token: string) => void, reject: (err: Error) => void }[]>([]);
  const loadWaiters = useRef<((stat: AuthStat) => void)[]>([]);

  // When session becomes ready, settle any pending calls
  useEffect(() => {
    if (status !== "loading") {
      loadWaiters.current.forEach((resolve)=>resolve(status as AuthStat));
      loadWaiters.current = [];
    }
    const token = session?.accessToken;
    if (status === "authenticated" && token) {
      waiters.current.forEach(({ resolve }) => resolve(token));
      waiters.current = [];
    } else if (status === "unauthenticated") {
      //Reject rather than leave callers awaiting a promise that can never settle
      waiters.current.forEach(({ reject }) => reject(new NotAuthenticatedError()));
      waiters.current = [];
    }
  }, [status, session]);

  const waitUntilReady = useCallback(() =>
    new Promise<string>((resolve, reject) => {
      const token = session?.accessToken;
      if (status === "authenticated" && token) {
        resolve(token);
      } else if (status === "unauthenticated") {
        reject(new NotAuthenticatedError());
      } else {
        waiters.current.push({ resolve, reject });
      }
    }), [session, status]);

  const waitUntilLoaded = useCallback(() =>
    new Promise<AuthStat>((resolve) => {
      if (status !== "loading") {
        resolve(status as AuthStat)
      } else {
        loadWaiters.current.push(resolve);
      }
    }), [status]);

  const sessionStatus = useCallback(async () => {
    return await waitUntilLoaded();
  }, [waitUntilLoaded]);

  const backendGet = useCallback(async (path: string, noAuth: boolean = false) => {
    if (noAuth) {
      return api.get(path)
    } else {
      const token = await waitUntilReady();
      return api.get(path, { headers: { Authorization: `Bearer ${token}` } });
    }
  }, [waitUntilReady]);

  const backendPost = useCallback(async (path: string, body: Object) => {
    const token = await waitUntilReady();
    return api.post(path, body, { headers: { Authorization: `Bearer ${token}` } });
  }, [waitUntilReady]);

  //The object is memoized as well as the functions - components pass `reqs` around as a
  //single prop and put it in dependency arrays, which a fresh object would break just as
  //surely as a fresh function
  return useMemo(
    () => ({ backendGet, backendPost, sessionStatus }),
    [backendGet, backendPost, sessionStatus],
  );
}
