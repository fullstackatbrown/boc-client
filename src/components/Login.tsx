"use client";
import axios from "axios";
import { useLogin } from "@/contexts/LoginContext";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
function Login(props: any) {
  const { isLoggedIn, setIsLoggedIn } = useLogin();

  const handleLoginSuccess = async (response: { code: string }) => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth`,
        {
          code: response.code,
        },
      );
      localStorage.setItem("access_token", data.access_token);
      window.location.reload();
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during authentication", error);
      setIsLoggedIn(false);
    }
  };

  const handleLoginFailure = (error: unknown) => {
    console.error("Login failed", error);
    setIsLoggedIn(false);
  };

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginFailure,
    flow: "auth-code",
  });

  return (
    <span
      onClick={() => {
        login();
      }}
      className="cursor-pointer"
    >
      {props.children}
    </span>
  );
}

export default Login;
