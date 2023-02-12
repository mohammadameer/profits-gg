import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env/server.mjs";
import { prisma } from "./db";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { StripeSubscriptionStatus } from "@prisma/client";
import { createTransport } from "nodemailer";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      stripeSubscriptionItemId: string;
      stripeSubscriptionStatus: StripeSubscriptionStatus;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
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
      });

      session = {
        user: {
          id: session?.user?.id as string,
          stripeCustomerId: dbUser?.stripeCustomerId as string,
          stripeSubscriptionId: dbUser?.stripeSubscriptionId as string,
          stripeSubscriptionItemId: dbUser?.stripeSubscriptionItemId as string,
          stripeSubscriptionStatus:
            dbUser?.stripeSubscriptionStatus as StripeSubscriptionStatus,
        },
        expires: session?.expires as string,
      };

      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      await prisma.list.createMany({
        data: [
          {
            name: "تحت التواصل",
            description: "",
            userId: user.id,
          },
          {
            name: "تم التواصل",
            description: "",
            userId: user.id,
          },
          {
            name: "بانتظار الرد",
            description: "",
            userId: user.id,
          },
          {
            name: "مؤهل",
            description: "",
            userId: user.id,
          },
          {
            name: "غير مؤهل",
            description: "",
            userId: user.id,
          },
        ],
      });
    },
  },

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
          url.origin,
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
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ],
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
