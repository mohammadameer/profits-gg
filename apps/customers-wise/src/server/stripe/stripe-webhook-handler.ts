import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

// retrieves a Stripe customer id for a given organization if it exists or creates a new one
export const getOrCreateStripeCustomerIdForOrganization = async ({
  stripe,
  prisma,
  organizationId,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  organizationId: string;
}) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      user: true,
    }
  });

  if (!organization) throw new Error("organization not found");

  if (organization.stripeCustomerId) {
    return organization.stripeCustomerId;
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: organization.user?.email ?? undefined,
    name: organization.name ?? undefined,
    // use metadata to link this Stripe customer to internal organization id
    metadata: {
      organizationId,
    },
  });

  // update with new customer id
  const updatedOrganization = await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  if (updatedOrganization.stripeCustomerId) {
    return updatedOrganization.stripeCustomerId;
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
    subscriptionId as string
  );
  const organizationId = subscription.metadata.organizationId;

  // update organization with subscription data
  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
    },
  });
};

export const handleSubscriptionCreatedOrUpdated = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const organizationId = subscription.metadata.organizationId;

  // update organization with subscription data
  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
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
  const organizationId = subscription.metadata.organizationId;

  // remove subscription data from organization
  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
    },
  });
};
