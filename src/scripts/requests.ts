import api from "@/scripts/api";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react"

export default function makeRequesters() {
    const { data: session, status } = useSession();
    const [token, setToken] = useState<any>(null)

    useEffect(() => { //Wait for session to be defined, then set access token
        if (status !== "loading") {
          setToken(session!.jwt.accessToken)
        }
      }, [status]);

      const backendGet = async (path: string) => {
        return api.get(path, {
            headers: { token: token },
        })
      }
      const backendPost = async (path: string, body: Object) => {
        return api.post(
            "/leader/create-trip",
            body,
            {
              headers: {
                token: token,
              },
            },
        );
      }
      return { backendGet, backendPost }
}