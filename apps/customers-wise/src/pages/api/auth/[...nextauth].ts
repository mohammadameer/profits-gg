import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import Stripe from "stripe";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import { createTransport } from "nodemailer";
import { StripeSubscriptionStatus } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user.id) {
        session.user.id = user.id;
      }

      const dbUser = await prisma.user.findFirst({
        where: {
          id: session?.user?.id,
        },
        include: {
          organization: true,
        },
      });

      const organization = await prisma.organization.findUnique({
        where: {
          id: dbUser?.organizationId ?? undefined,
        },
      });

      session = {
        user: {
          id: session?.user?.id as string,
          organization: {
            id: organization?.id as string,
            stripeCustomerId: organization?.stripeCustomerId as string,
            stripeSubscriptionId: organization?.stripeSubscriptionId as string,
            stripeSubscriptionStatus:
              organization?.stripeSubscriptionStatus as StripeSubscriptionStatus,
          },
        },
        expires: session?.expires as string,
      };

      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT
          ? +process.env.EMAIL_SERVER_PORT
          : 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      generateVerificationToken() {
        return String(Math.floor(1000 + Math.random() * 9000));
      },
      async sendVerificationRequest(params) {
        const { identifier, provider, token } = params;
        const url = new URL(params.url);
        // url.searchParams.delete("token") // uncomment if you want the user to type this manually
        const signInURL = new URL(
          `/auth/email?${url.searchParams}`,
          url.origin
        );

        const result = await createTransport(provider.server).sendMail({
          to: identifier,
          from: provider.from,
          subject: `تسجيل الدخول لـ ${signInURL.host}`,
          text: `استخدم هذا الرمز: ${token} لتسجيل الدخول`,
          html: `<body style="background: #111827; padding: 20px 10px;">
          <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #374151; max-width: 600px; margin: auto; border-radius: 15px;">
            <tr>
              <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: white;">  استخدم هذا الرمز لتسجيل الدخول </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0px; font-size: 35px; font-family: Helvetica, Arial, sans-serif; color: white;">  ${token} </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: white;"> إذا لم تقم بطلب هذا الرمز يمكنك تجاهل هذا الإيميل. </td>
            </tr>
          </table>
        </body>`,
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
