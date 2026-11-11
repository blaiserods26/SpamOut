import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest } from "next/server";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_nextauth_secret_for_development",
};

const nextAuthHandler = NextAuth(authOptions);

async function handler(req: NextRequest, context: any) {
  const params = context?.params ? await context.params : undefined;
  return (nextAuthHandler as any)(req, { ...context, params });
}

export { handler as GET, handler as POST };
