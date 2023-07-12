import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import Stripe from "stripe"
import { TRPCError } from "@trpc/server"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe Secret Key")
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
})

export const checkoutRouter = createTRPCRouter({
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    if (!process.env.HOST) {
      throw new Error("Missing Host")
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: {
        userId: ctx.userId,
        credits: 100,
      },
      line_items: [{ price: process.env.STRIPE_CREDIT_PRICE, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.HOST}/`,
      cancel_url: `${process.env.HOST}/`,
    })
    if (!checkoutSession) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not create checkout session",
      })
    }
    return checkoutSession.url
  }),
})
