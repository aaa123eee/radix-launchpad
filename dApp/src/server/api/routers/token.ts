import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const tokenRouter = createTRPCRouter({
  getAll: publicProcedure
    // .input(z.object({ text: z.string() }))
    .query(async ({ ctx }) => {
      return await ctx.db.token.findMany();
    }),

  createToken: publicProcedure
    .input(z.object({ address: z.string().min(1), name: z.string().min(1), symbol: z.string().min(1), iconUrl: z.string().min(1), supply: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.token.create({
        data: {
          address: input.address,
          name: input.name,
          symbol: input.symbol,
          iconUrl: input.iconUrl,
          supply: input.supply,
        },
      });
    }),
});
