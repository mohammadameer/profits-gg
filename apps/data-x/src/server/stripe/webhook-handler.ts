import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

const productsMaxes = {
  basic: {
    export: 500,
    search: 1000,
  },
  preferred: {
    export: 2500,
    search: 5000,
  },
  enterprise: {
    export: 5000,
    search: 10000,
  },
};

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

  // update with new customer id
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  if (updatedUser.stripeCustomerId) {
    return updatedUser.stripeCustomerId;
  }
};

export const handleInvoicePaid = async ({
  event,
  stripe,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: PrismaClient;
}) => {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription;

  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string,
  );

  const subscriptionItem = await stripe.subscriptionItems.retrieve(
    subscription.items.data[0]?.id as string,
    {
      expand: ["price.product"],
    },
  );

  const product = subscriptionItem.price.product as Stripe.Product;
  const productName = product.name as string;

  const userId = subscription.metadata.userId;

  // update organization with subscription data
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionItemId: subscription.items.data[0]?.id,
      stripeSubscriptionStatus: subscription.status,
      exportCredits:
        productsMaxes[productName as keyof typeof productsMaxes].export,
      searchMax:
        productsMaxes[productName as keyof typeof productsMaxes].search,
    },
  });
};

export const handleSubscriptionCreatedOrUpdated = async ({
  event,
  stripe,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata.userId;

  const subscriptionItem = await stripe.subscriptionItems.retrieve(
    subscription.items.data[0]?.id as string,
    {
      expand: ["price.product"],
    },
  );

  const product = subscriptionItem.price.product as Stripe.Product;
  const productName = product.name as string;

  let exportCredits;
  let searchMax;

  if (subscription.status === "active") {
    exportCredits =
      productsMaxes[productName as keyof typeof productsMaxes].export;
    searchMax = productsMaxes[productName as keyof typeof productsMaxes].search;
  } else {
    exportCredits = 0;
    searchMax = 10;
  }

  // update organization with subscription data
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionItemId: subscription.items.data[0]?.id,
      stripeSubscriptionStatus: subscription.status,
      exportCredits,
      searchMax,
    },
  });
};

export const handleSubscriptionCanceled = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata.userId;

  // remove subscription data from organization
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionItemId: null,
      stripeSubscriptionStatus: null,
      exportCredits: 0,
      searchMax: 10,
    },
  });
};
