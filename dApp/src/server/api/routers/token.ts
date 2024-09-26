import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const tokenRouter = createTRPCRouter({
  getAll: publicProcedure
    // .input(z.object({ text: z.string() }))
    .query(async ({ ctx }) => {
      return ctx.db.token.findMany();
    }),

  getByAddress: publicProcedure
    .input(z.object({ address: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      console.log(input);
      return ctx.db.token.findUnique({
        where: { address: input.address },
      });
    }),

  createToken: publicProcedure
    .input(
      z.object({
        address: z.string().min(1),
        name: z.string().min(1),
        symbol: z.string().min(1),
        iconUrl: z.string().min(1),
        supply: z.string(),
        componentAddress: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.token.create({
        data: {
          address: input.address,
          name: input.name,
          symbol: input.symbol,
          iconUrl: input.iconUrl,
          supply: input.supply,
          component: {
            create: {
              address: input.componentAddress,
            },
          },
        },
      });
    }),
});
