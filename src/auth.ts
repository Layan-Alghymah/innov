import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import authConfig from "@/auth.config";
import { prisma } from "@/server/db";
import { loginSchema } from "@/modules/auth/schema";

/**
 * Full (Node-runtime) Auth.js instance.
 *
 * - Credentials provider is enabled for local development only.
 * - The Prisma adapter is wired so that Microsoft Entra ID (OAuth) can be added
 *   later without restructuring — add an Entra provider to `providers` and users
 *   will be linked through the adapter tables (accounts/sessions).
 * - JWT session strategy is required by the Credentials provider.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
});
