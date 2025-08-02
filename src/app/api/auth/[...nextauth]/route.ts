import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account, profile }) {
      // On sign in, persist the OAuth access token to the token right here
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile.sub; // Google user ID
      }
      return token;
    },

    async session({ session, token }) {
      // Add the token info to the session so you can access it on the client
      session.jwt = token;
      session.user.id = token.id; // optional
      session.accessToken = token.accessToken; // if you want
      return session;
    },
  },
});

export const { GET, POST } = handlers
