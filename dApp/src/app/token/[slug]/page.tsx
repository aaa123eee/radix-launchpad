"use client";

import React from "react";
import { api } from "@/trpc/react";

export default function TokenPage({
  params,
}: {
  params: { tokenAddress: string };
}) {
  const tokenAddress = params.tokenAddress;

  const { data: token, isLoading } = api.token.getByAddress.useQuery({
    address: params.tokenAddress,
  });

  const orders = api.order.getByTokenAddress.useQuery({ tokenAddress });

  console.log(params);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <div className="flex items-center mb-8">
        <Image src={token.iconUrl} alt={token.name} width={64} height={64} className="mr-4" />
        <div>
          <h1 className="text-3xl font-bold">{token.name}</h1>
          <p className="text-xl">{token.symbol}</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Token Details</h2>
        <p>Address: {token.address}</p>
        <p>Total Supply: {token.supply}</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Order Book</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Buy Orders</h3>
            {orders.filter(o => o.isBuy).map((order, index) => (
              <div key={index} className="bg-green-100 p-2 rounded">
                <p>Price: {order.price}</p>
                <p>Amount: {order.amount}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Sell Orders</h3>
            {orders.filter(o => !o.isBuy).map((order, index) => (
              <div key={index} className="bg-red-100 p-2 rounded">
                <p>Price: {order.price}</p>
                <p>Amount: {order.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
}
