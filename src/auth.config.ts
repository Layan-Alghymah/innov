import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration shared between the middleware (edge runtime)
 * and the full Node config in `auth.ts`. It must NOT import Prisma, bcrypt, or
 * any Node-only module, because the middleware runs on the edge runtime.
 *
 * Route protection is enforced here (server-side) via the `authorized` callback
 * — not by merely hiding UI. Unauthenticated users hitting a protected route are
 * redirected to `/login`; authenticated users hitting `/login` go to `/dashboard`.
 */
const PUBLIC_ROUTES = ["/login"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // Real providers are added in `auth.ts` (Node runtime). Kept empty here so the
  // middleware bundle stays edge-safe.
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

      if (isPublic) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }
      // Any non-public route requires a session; returning false redirects to signIn.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
