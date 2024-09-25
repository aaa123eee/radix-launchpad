"use client";

import React from "react";
import { api } from "@/trpc/react";

export default function TokenPage({
  params,
}: {
  params: { tokenAddress: string };
}) {
  const tokenAddress = params.tokenAddress;

  console.log({ params, tokenAddress });

  const { data: token, isLoading: isTokenLoading } =
    api.token.getByAddress.useQuery({
      address: params.tokenAddress,
    });

  const { data: orders, isLoading: isOrdersLoading } =
    api.order.getByTokenAddress.useQuery({ tokenAddress });

  return (
    <div className="container mx-auto px-4 py-8">
      {isTokenLoading ? (
        <p>Loading token information...</p>
      ) : token ? (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-3xl font-bold">{token.name}</h1>
          <p className="mb-2 text-xl">Symbol: {token.symbol}</p>
          <p className="mb-4 text-gray-600">Address: {token.address}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Total Supply</h2>
              <p>{token.supply.toString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Token not found</p>
      )}

      <h2 className="mb-4 mt-8 text-2xl font-bold">Orders</h2>
      {isOrdersLoading ? (
        <p>Loading orders...</p>
      ) : orders && orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.address} className="rounded-lg bg-gray-100 p-4">
              <p>Order ID: {order.address}</p>
              <p>Amount: {order.amount.toString()}</p>
              <p>Price: {order.price.toString()}</p>
              <p>Type: {order.isBuy ? 'buy' : 'sell'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found for this token</p>
      )}
    </div>
  );
}
