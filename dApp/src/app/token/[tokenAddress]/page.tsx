"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import SwapForm from "@/app/components/features/swap-form";
import { Copy } from "lucide-react";

export default function TokenPage({
  params,
}: {
  params: { tokenAddress: string };
}) {
  const tokenAddress = params.tokenAddress;
  const [copied, setCopied] = useState(false);

  console.log({ params, tokenAddress });

  const { data: token, isLoading: isTokenLoading } =
    api.token.getByAddress.useQuery({
      address: params.tokenAddress,
    });

  const { data: componentData, isLoading } = api.component.getByTokenAddress.useQuery({ address: tokenAddress });

  const { data: orders, isLoading: isOrdersLoading } =
    api.order.getByTokenAddress.useQuery({ tokenAddress });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isTokenLoading ? (
        <p>Loading token information...</p>
      ) : token ? (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-3xl font-bold">{token.name}</h1>
          <p className="mb-2 text-xl">Symbol: {token.symbol}</p>
          <p className="mb-4 text-gray-600 break-all">
            Address: 
            <span 
              className={`bg-gray-100 px-1 py-0.5 rounded cursor-pointer inline-flex items-center transition-all duration-300 ${copied ? 'bg-green-200' : ''}`}
              onClick={() => copyToClipboard(token.address)}
            >
              {token.address}
              <Copy className={`ml-1 h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
            </span>
          </p>
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

      <br />

      {token && <SwapForm fromToken="XRD" toToken={token.symbol} price={ '0.5' } />}

      <br />

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
