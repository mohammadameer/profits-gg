import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { type initializePrisma } from "~/server/db";
import { expirationByAmount } from "~/utils/memberships";

// retrieves a Stripe customer id for a given user if it exists or creates a new one
export const getOrCreateStripeCustomerIdForUser = async ({
  stripe,
  prisma,
  userId,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("user not found");

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: user?.email ?? undefined,
    name: user.name ?? undefined,
    // use metadata to link this Stripe customer to internal organization id
    metadata: {
      userId,
    },
  });
};

export const handleCheckoutSessionCompleted = async ({
  event,
  stripe,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: ReturnType<typeof initializePrisma>;
}) => {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;

  let amount: number | undefined;

  amount = checkoutSession.amount_total ?? undefined;

  if (!amount) {
    throw new Error("amount not found");
  }

  const expirationSeconds = expirationByAmount[amount];

  if (expirationSeconds === undefined) {
    throw new Error("expirationSeconds not found");
  }

  const today = new Date();

  const expirationDate = new Date(today.getTime() + expirationSeconds * 1000);

  // get or create user using email and phone from checkout session
  await prisma.user.upsert({
    where: {
      phoneNumber: checkoutSession?.customer_details?.phone ?? undefined,
    },
    create: {
      name: checkoutSession?.customer_details?.name ?? undefined,
      email: checkoutSession?.customer_details?.email ?? undefined,
      phoneNumber: checkoutSession?.customer_details?.phone ?? undefined,
      stripeCustomerId: (checkoutSession.customer as string) ?? undefined,
      membershipExpiration: expirationDate,
    },
    update: {
      name: checkoutSession?.customer_details?.name ?? undefined,
      email: checkoutSession?.customer_details?.email ?? undefined,
      phoneNumber: checkoutSession?.customer_details?.phone ?? undefined,
      stripeCustomerId: (checkoutSession.customer as string) ?? undefined,
      membershipExpiration: expirationDate,
    },
  });
};
