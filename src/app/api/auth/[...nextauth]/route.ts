import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

//
// TEST IDENTITY BYPASS
//
// Signs in as an arbitrary Brown/RISD address without going through Google, so that
// automated tests can drive multi-user flows (several participants on one trip) that
// are otherwise untestable. The session it mints carries an `e2e:<email>` access token,
// which boc-server accepts in place of a real Google token while DEVELOPING is set.
//
// SAFETY: this provider is only registered when NEXT_PUBLIC_E2E === "1" AND the build is
// not a production build. Never set NEXT_PUBLIC_E2E in a deployed environment.
const E2E_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_E2E === "1" && process.env.NODE_ENV !== "production";

const e2eProvider = CredentialsProvider({
  id: "e2e",
  name: "E2E Test Login",
  credentials: { email: { label: "Email", type: "text" } },
  async authorize(credentials) {
    const email = String(credentials?.email ?? "").trim().toLowerCase();
    //Mirror the domain restriction enforced on the Google path
    if (!email.endsWith("@brown.edu") && !email.endsWith("@risd.edu")) return null;
    const [localPart] = email.split("@");
    const [first, ...rest] = localPart.split(".");
    return {
      id: email,
      email,
      name: `${first} ${rest.length > 0 ? rest.join(".") : "E2E"}`,
    };
  },
});

async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID ?? "",
      client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken ?? "",
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // fallback
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    ...(E2E_AUTH_ENABLED ? [e2eProvider] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) { //Users without brown/risd emails don't ever receive sessions - instead, they get booted to the error page
      if (account?.provider === "google") {
        return (profile?.email?.endsWith("@brown.edu") || profile?.email?.endsWith("@risd.edu")) ?? false;
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      //Test identity sessions carry a synthetic token instead of a Google one, and never refresh
      if (E2E_AUTH_ENABLED && account?.provider === "e2e") {
        token.accessToken = `e2e:${user?.email ?? token.email}`;
        token.refreshToken = undefined;
        token.accessTokenExpires = undefined;
        return token;
      }
      if (token.accessToken?.startsWith("e2e:")) return token;

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = (account.expires_at ?? 0) * 1000; // milliseconds
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // attach Google tokens to session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    error: "/api/auth/error", // Create this page in your app
  }
});
export const { GET, POST } = handlers;
