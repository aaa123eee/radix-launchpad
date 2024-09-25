"use client";

import React, {useEffect} from "react";
import { api } from "@/trpc/react";
import {useAtom} from "jotai/index";
import {gatewayApiAtom} from "@/app/rdt-provider";

export default function TokenPage({
  params,
}: {
  params: { tokenAddress: string };
}) {
  const [tokenAmounts, setTokenAmounts] = React.useState({token: 0, xrd: 0});
  const tokenAddress = params.tokenAddress;

  const [gatewayApi] = useAtom(gatewayApiAtom);

  console.log({ params, tokenAddress });

  const { data: token, isLoading: isTokenLoading } =
    api.token.getByAddress.useQuery({
      address: params.tokenAddress,
    });

  const { data: componentData, isLoading } =
    api.component.getByTokenAddress.useQuery({ address: tokenAddress });

  console.log({ componentData });

  useEffect(() => {
    (async () => {
      if (!gatewayApi || !componentData || !componentData[0]) {
        return;
      }

      const componentAddress = componentData[0].address;

      const componentDetails = await gatewayApi.state.getEntityDetailsVaultAggregated(
          componentAddress
      );

      if (!componentDetails) {
        return;
      }
      //@ts-ignore
      const poolAddress = componentDetails?.details?.state.fields[0].value;

      const poolResp = await gatewayApi.state.getEntityDetailsVaultAggregated(poolAddress);

      const [token, xrd] = poolResp.fungible_resources.items;
      const xrdAmount = xrd.vaults.items[0].amount;
      const tokenAmount = token.vaults.items[0].amount;
      setTokenAmounts({ token: Number(tokenAmount), xrd: Number(xrdAmount) });
    })();
  }, [componentData]);

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
              <p>Type: {order.isBuy ? "buy" : "sell"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found for this token</p>
      )}
    </div>
  );
}
