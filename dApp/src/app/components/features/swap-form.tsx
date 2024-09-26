"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp } from "lucide-react"
import Decimal from 'decimal.js'

interface SwapFormProps {
  fromToken: string;
  toToken: string;
  xrdAmount: number;
  tokenAmount: number;
}

function calculateSwapAmount(xrdAmount: number, tokenAmount: number, buyAmount: number, isBuyingToken: boolean): number {
  const xrd = new Decimal(xrdAmount);
  const token = new Decimal(tokenAmount);
  const amount = new Decimal(buyAmount);

  // Constant product formula: x * y = k
  const k = xrd.mul(token);

  if (isBuyingToken) {
    // Buying token with XRD
    const newXrd = xrd.add(amount);
    const newToken = k.div(newXrd);
    return token.sub(newToken).toDecimalPlaces(8).toNumber();
  } else {
    // Buying XRD with token
    const newToken = token.add(amount);
    const newXrd = k.div(newToken);
    return xrd.sub(newXrd).toDecimalPlaces(8).toNumber();
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


export default function SwapForm({ fromToken: initialFromToken, toToken: initialToToken, tokenAmount, xrdAmount }: SwapFormProps) {
  console.log({initialFromToken, initialToToken});

  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(initialFromToken);
  const [toToken, setToToken] = useState(initialToToken);

  const price = useMemo(() => {
    // Calculate price using constant product formula: x * y = k
    // Where x is the XRD amount, y is the token amount, and k is the constant product
    if (xrdAmount && tokenAmount) {
      const xrd = new Decimal(xrdAmount);
      const token = new Decimal(tokenAmount);
      return xrd.div(token).toDecimalPlaces(8).toNumber();
    }
    return 0;
  }, [xrdAmount, tokenAmount]);


  useEffect(() => {
    if (fromAmount && price) {
      const from = new Decimal(fromAmount);
      const priceDecimal = new Decimal(price);
      const to = fromToken === initialFromToken
        ? from.div(priceDecimal)
        : from.mul(priceDecimal);
      setToAmount(to.toDecimalPlaces(8).toFixed());
    } else {
      setToAmount('');
    }
  }, [fromAmount, price, fromToken, initialFromToken]);

  const handleSwap = () => {
    // Here you would typically interact with a smart contract
    console.log(`Swapping ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`);
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,8}$/;
    if (regex.test(value) || value === '') {
      setFromAmount(value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Swap Tokens</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="fromAmount" className="block text-sm font-medium text-muted-foreground mb-1">From</label>
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
            <div className="w-[100px] px-3 py-2 border rounded-md bg-background">
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
          <label htmlFor="toAmount" className="block text-sm font-medium text-muted-foreground mb-1">To</label>
          <div className="flex space-x-2">
            <Input
              id="toAmount"
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={toAmount}
              className="flex-grow"
              readOnly
            />
            <div className="w-[100px] px-3 py-2 border rounded-md bg-background">
              {toToken}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Exchange Rate: 1 {initialFromToken} = { price } {initialToToken}</p>
        </div>

        <Button className="w-full" onClick={handleSwap}>
          Swap
        </Button>
      </div>
    </div>
  )
}
