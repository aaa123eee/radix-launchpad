"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import SwapForm from "@/app/components/features/swap-form";
import { Copy } from "lucide-react";
import { useAtom } from "jotai/index";
import { gatewayApiAtom, rdtAtom, userAccountAddressAtom } from "@/app/rdt-provider";
import { Api } from "@/lib/radixapi";
import { xrdAddress } from "@/lib/const";

export default function TokenPage({
  params,
}: {
  params: { tokenAddress: string };
}) {
  const [tokenAmounts, setTokenAmounts] = useState({ token: 0, xrd: 0 });
  const tokenAddress = params.tokenAddress;
  const [copied, setCopied] = useState(false);
  const [userAccountAddress] = useAtom(userAccountAddressAtom);
  const [rdt] = useAtom(rdtAtom);

  const [gatewayApi] = useAtom(gatewayApiAtom);

  const { data: token, isLoading: isTokenLoading } =
    api.token.getByAddress.useQuery({
      address: params.tokenAddress,
    });

  const { data: componentData, isLoading } =
    api.component.getByTokenAddress.useQuery({ address: tokenAddress });

  useEffect(() => {
    (async () => {
      if (!gatewayApi || !componentData || !componentData[0]) {
        return;
      }

      const componentAddress = componentData[0].address;

      const componentDetails =
        await gatewayApi.state.getEntityDetailsVaultAggregated(
          componentAddress,
        );

      if (!componentDetails) {
        return;
      }

      //@ts-ignore
      const poolAddress: string =
        componentDetails?.details?.state?.fields[0].value;

      const poolInfo = await Api.getPoolInfo(poolAddress);

      console.log({poolInfo});

      const resourceBalances = poolInfo.data.map((resource) => ({
        resourceAddress: resource.resource_address,
        balance: resource.resource_balance,
      }));

      const xrdBalance = resourceBalances.find(
        (el) => el.resourceAddress === xrdAddress,
      );
      const tokenBalance = resourceBalances.find(
        (el) => el.resourceAddress !== xrdAddress,
      );

      setTokenAmounts({
        token: Number(tokenBalance?.balance),
        xrd: Number(xrdBalance?.balance),
      });
    })();
  }, [componentData, gatewayApi]);

  const { data: orders, isLoading: isOrdersLoading } =
    api.order.getByTokenAddress.useQuery({ tokenAddress });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleSwap(fromAmount: string, fromToken: string) {
    if (!userAccountAddress || !tokenAddress || !componentData || !componentData[0]) {
      return;
    }

    const componentAddress = componentData[0].address;

    const fromTokenAddress = fromToken === "XRD" ? xrdAddress : tokenAddress;

    const request = createSwapManifest({
      userAccountAddress,
      fromTokenAddress,
      componentAddress,
      fromAmount,
    });

    console.log({request}, {userAccountAddress,
      fromTokenAddress,
      componentAddress,
      fromAmount,});

    const result = await rdt?.walletApi.sendTransaction({
      transactionManifest: request,
    });

    console.log({result});
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isTokenLoading ? (
        <p>Loading token information...</p>
      ) : token ? (
        <div className="rounded-lg p-6 shadow-md">
          <h1 className="mb-4 text-3xl font-bold">{token.name}</h1>
          <p className="mb-2 text-xl">Symbol: {token.symbol}</p>

          <div className="w-[330px] h-[330px]">
            <div className="w-[310px] h-[310px] relative z-10 bg-background m-[10px]">
              <img src={token.iconUrl} alt={`${token.name} logo`} className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="mb-4 break-all">
            Address:
            <span
              className={`inline-flex cursor-pointer items-center rounded px-1 py-0.5 transition-all duration-300 ${copied ? "bg-green-200" : ""}`}
              onClick={() => copyToClipboard(token.address)}
            >
              {token.address}
              <Copy
                className={`ml-1 h-4 w-4 ${copied ? "text-green-500" : ""}`}
              />
            </span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Total Supply</h2>
              <p>100000000000</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Token not found</p>
      )}

      <br />

      {token && (
        <SwapForm
          fromToken="XRD"
          toToken={token.symbol}
          xrdAmount={tokenAmounts.xrd}
          tokenAmount={tokenAmounts.token}
          onSubmit={handleSwap}
        />
      )}

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

interface CreateSwapRequestParams {
  userAccountAddress: string;
  fromTokenAddress: string;
  componentAddress: string;
  fromAmount: string;
}

function createSwapManifest({
  userAccountAddress,
  fromTokenAddress,
  componentAddress,
  fromAmount,
}: CreateSwapRequestParams) {
  return `
CALL_METHOD
    Address("${userAccountAddress}")
    "withdraw"
    Address("${fromTokenAddress}")
    Decimal("${fromAmount}")
;
TAKE_FROM_WORKTOP
    Address("${fromTokenAddress}")
    Decimal("${fromAmount}")
    Bucket("bucket1")
;
CALL_METHOD
    Address("${componentAddress}")
    "swap_tokens"
    Bucket("bucket1")
;
CALL_METHOD
    Address("${userAccountAddress}")
    "try_deposit_batch_or_refund"
    Expression("ENTIRE_WORKTOP")
    Enum<0u8>()
;
  `;
}
