import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const orderRouter = createTRPCRouter({
  getAll: publicProcedure
    // .input(z.object({ text: z.string() }))
    .query(async ({ ctx }) => {
      return await ctx.db.order.findMany();
    }),

  getByTokenAddress: publicProcedure
    .input(z.object({ tokenAddress: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.order.findMany({
        where: { tokenAddress: input.tokenAddress },
      });
    }),

  createOrder: publicProcedure
    .input(
      z.object({
        tokenAddress: z.string().min(1),
        isBuy: z.boolean(),
        price: z.number(),
        amount: z.number(),
        address: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.create({
        data: {
          tokenAddress: input.tokenAddress,
          isBuy: input.isBuy,
          price: input.price,
          amount: input.amount,
          address: input.address,
        },
      });
    }),
});
