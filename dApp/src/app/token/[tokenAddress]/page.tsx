"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/trpc/react";
import SwapForm from "@/app/components/features/swap-form";
import { Copy, FrownIcon } from "lucide-react";
import { useAtom } from "jotai/index";
import {
  gatewayApiAtom,
  rdtAtom,
  userAccountAddressAtom,
} from "@/app/rdt-provider";
import { Api } from "@/lib/radixapi";
import { xrdAddress } from "@/lib/const";
import { motion } from "framer-motion";
import { isSwappingAtom } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

function MovingBorder({ color, speed }: { color: string; speed: number }) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: `repeating-linear-gradient(
          45deg,
          ${color} 0,
          ${color} 2px,
          transparent 2px,
          transparent 8px
        ),
        repeating-linear-gradient(
          -45deg,
          ${color} 0,
          ${color} 2px,
          transparent 2px,
          transparent 8px
        )`,
        backgroundSize: "16px 16px",
      }}
      animate={{
        backgroundPosition: ["0px 0px", "16px 16px"],
      }}
      transition={{
        duration: speed,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  );
}

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
  const [, setIsSwapping] = useAtom(isSwappingAtom);

  const [gatewayApi] = useAtom(gatewayApiAtom);

  const { toast } = useToast();
  const searchParams = useSearchParams()
 
  const initialAmount = searchParams.get('amount')

  const { data: token, isLoading: isTokenLoading } =
    api.token.getByAddress.useQuery({
      address: params.tokenAddress,
    });

  useEffect(() => {
    (async () => {
      if (!gatewayApi || !token || !token.component?.address) {
        return;
      }

      const componentDetails =
        await gatewayApi.state.getEntityDetailsVaultAggregated(
          token.component?.address,
        );

      if (!componentDetails) {
        return;
      }

      //@ts-ignore
      const poolAddress = componentDetails?.details?.state.fields[0].value;

      const poolResp =
          await gatewayApi.state.getEntityDetailsVaultAggregated(poolAddress);

      const [apiToken, xrd] = poolResp.fungible_resources.items;
      const xrdAmount = xrd?.vaults?.items[0]?.amount;
      const tokenAmount = apiToken?.vaults?.items[0]?.amount;
      setTokenAmounts({ token: Number(tokenAmount), xrd: Number(xrdAmount) });
    })();
  }, [gatewayApi, token]);

  const { data: orders, isLoading: isOrdersLoading } =
    api.order.getByTokenAddress.useQuery({ tokenAddress });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleSwap(fromAmount: string, fromToken: string) {
    try {
      setIsSwapping(true);
      if (
        !userAccountAddress ||
        !tokenAddress ||
        !token ||
        !token.component?.address
      ) {
        return;
      }

      const componentAddress = token.component?.address;

      const fromTokenAddress = fromToken === "XRD" ? xrdAddress : tokenAddress;

      const request = createSwapManifest({
        userAccountAddress,
        fromTokenAddress,
        componentAddress,
        fromAmount,
      });

      console.log(
        { request },
        { userAccountAddress, fromTokenAddress, componentAddress, fromAmount },
      );

      const result = await rdt?.walletApi.sendTransaction({
        transactionManifest: request,
      });

      console.log({ result });
      toast({
        title: "Swap successful",
        description: "Your swap has been successful",
      });
    } catch (error) {
      console.error("Error during swap:", error);
      // Handle the error appropriately, e.g., show an error message to the user
    } finally {
      setIsSwapping(false);
    }
  }

  const borderColor = useMemo(() => {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
  }, []);

  const borderSpeed = useMemo(() => {
    return Math.random() * 0.9 + 0.3;
  }, []);

  function getRandomRotation() {
    return Math.random() * 8 - 4;
  }

  function getRandomScale() {
    return Math.random() * 0.1 + 0.95;
  }

  if (isTokenLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <FrownIcon className="mb-4 h-16 w-16 text-yellow-500" />
        <h2 className="mb-2 text-2xl font-bold">Token Not Found</h2>
        <p className="text-gray-600">The requested token could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center md:flex-row md:space-x-8">
        <div className="w-full md:w-1/2">
          {token && (
            <SwapForm
              fromToken="XRD"
              toToken={token.symbol}
              xrdAmount={tokenAmounts.xrd}
              tokenAmount={tokenAmounts.token}
              onSubmit={handleSwap}
            />
          )}
        </div>
        <div className="mt-8 w-full md:mt-0 md:w-1/2">
          <div className="rounded-lg p-6 shadow-md">
            <h1 className="mb-4 text-3xl font-bold">{token.name}</h1>
            <p className="mb-2 text-xl">Symbol: {token.symbol}</p>

            <motion.div className="relative h-[330px] w-[330px] overflow-hidden">
              <MovingBorder color={borderColor} speed={borderSpeed} />
              <div className="image-container relative z-10 m-[10px] h-[310px] w-[310px] bg-background">
                <img
                  src={token.iconUrl}
                  alt={`${token.name} logo`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </motion.div>

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
        </div>
      </div>

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
