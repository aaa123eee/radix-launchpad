import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const componentRouter = createTRPCRouter({
  getByTokenAddress: publicProcedure
    .input(z.object({ address: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const component = await ctx.db.component.findMany({
        where: {
          tokenAddress: input.address,
        },
        include: {
          token: true,
        },
      });
      return component;
    }),

  create: publicProcedure
    .input(
      z.object({
        address: z.string().min(1),
        tokenAddress: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.component.create({
        data: {
          address: input.address,
          tokenAddress: input.tokenAddress,
        },
      });
    }),
});
