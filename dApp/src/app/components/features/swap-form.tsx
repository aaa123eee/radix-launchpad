"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp } from "lucide-react";
import Decimal from "decimal.js";
import { isSwappingAtom } from "@/lib/utils";
import { useAtom } from "jotai";

interface SwapFormProps {
  fromToken: string;
  toToken: string;
  xrdAmount: number;
  tokenAmount: number;
  onSubmit: (
    fromAmount: string,
    fromToken: string,
    toAmount: string,
    toToken: string,
  ) => void;
}

function calculateSwapAmount(
  xrdAmount: number,
  tokenAmount: number,
  buyAmount: string,
  isBuyingToken: boolean,
): Decimal {
  const xrd = new Decimal(xrdAmount || 0);
  const token = new Decimal(tokenAmount || 0);
  const amount = new Decimal(buyAmount || 0);

  // Constant product formula: x * y = k
  const k = xrd.mul(token);

  if (isBuyingToken) {
    // Buying token with XRD
    const newXrd = xrd.add(amount);
    const newToken = k.div(newXrd);
    return token.sub(newToken);
  } else {
    // Buying XRD with token
    const newToken = token.add(amount);
    const newXrd = k.div(newToken);
    return xrd.sub(newXrd);
  }
}
// Example usage:
// 1. Buying token with XRD
// console.log(calculateSwapAmount(1000, 100, 50, true));
// This might output something like 4.76190476, meaning you get about 4.76 tokens for 50 XRD

// 2. Buying XRD with token
// console.log(calculateSwapAmount(1000, 100, 5, false));
// This might output something like 47.61904762, meaning you get about 47.62 XRD for 5 tokens

// 3. Edge case: Very small amounts
// console.log(calculateSwapAmount(1000000, 1000000, 0.00001, true));
// This will show how the function handles very small swap amounts

// 4. Edge case: Very large amounts
// console.log(calculateSwapAmount(1000000, 1000000, 999999, false));
// This will show how the function handles very large swap amounts relative to pool size

export default function SwapForm({
  fromToken: initialFromToken,
  toToken: initialToToken,
  tokenAmount,
  xrdAmount,
  onSubmit,
}: SwapFormProps) {
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState(initialFromToken);
  const [toToken, setToToken] = useState(initialToToken);

  const [isSwapping] = useAtom(isSwappingAtom);

  const price = useMemo(() => {
    if (xrdAmount && tokenAmount) {
      const xrd = new Decimal(xrdAmount);
      const token = new Decimal(tokenAmount);
      return xrd.div(token).toDecimalPlaces(8).toNumber();
    }
    return 0;
  }, [xrdAmount, tokenAmount]);

  const handleSwap = () => {
    onSubmit(fromAmount, fromToken, toAmount, toToken);
  };

  useEffect(() => {
    console.log({ xrdAmount, tokenAmount });
    const toAmount = calculateSwapAmount(xrdAmount, tokenAmount, "1", true);
    setToAmount(toAmount.toDecimalPlaces(8).toFixed());
  }, [xrdAmount, tokenAmount]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,8}$/;
    if (regex.test(value) || value === "") {
      setFromAmount(value);

      const toAmount = calculateSwapAmount(
        xrdAmount,
        tokenAmount,
        value,
        fromToken === initialFromToken,
      );
      setToAmount(toAmount.toDecimalPlaces(8).toFixed());
    }
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,8}$/;
    if (regex.test(value) || value === "") {
      setToAmount(value);

      const fromAmount = calculateSwapAmount(
        xrdAmount,
        tokenAmount,
        value,
        toToken !== initialToToken,
      );
      setFromAmount(fromAmount.toDecimalPlaces(8).toFixed());
    }
  };

  const isBuy = fromToken === initialFromToken;
  const formOutlineColor = isBuy ? "border-green-500" : "border-red-500";

  return (
    <div
      className={`mx-auto w-full max-w-md rounded-xl border-2 bg-card p-6 shadow-lg ${formOutlineColor}`}
    >
      <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
        {isBuy ? "Buy" : "Sell"} {initialToToken}
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="fromAmount"
            className="mb-1 block text-sm font-medium text-muted-foreground"
          >
            From
          </label>
          <div className="flex space-x-2">
            <Input
              id="fromAmount"
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={fromAmount}
              onChange={handleFromAmountChange}
              className="flex-grow"
            />
            <div className="w-[120px] truncate rounded-md border bg-background px-3 py-2">
              {fromToken}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" size="icon" onClick={handleSwapTokens}>
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <label
            htmlFor="toAmount"
            className="mb-1 block text-sm font-medium text-muted-foreground"
          >
            To
          </label>
          <div className="flex space-x-2">
            <Input
              id="toAmount"
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={toAmount}
              onChange={handleToAmountChange}
              className="flex-grow"
            />
            <div className="w-[120px] truncate rounded-md border bg-background px-3 py-2">
              {toToken}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Exchange Rate: 1 {initialToToken} = {price} {initialFromToken}
          </p>
        </div>

        <Button className="w-full" onClick={handleSwap} disabled={isSwapping}>
          {isSwapping ? (
            <div className="flex items-center justify-center">
              <span className="ml-2">Swapping...</span>
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          ) : (
            "Swap"
          )}
        </Button>
      </div>
    </div>
  );
}
