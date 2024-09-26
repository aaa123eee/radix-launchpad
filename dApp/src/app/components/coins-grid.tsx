"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FrownIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Roulette from "./features/roulette";

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`
}

function getRandomSpeed() {
  return Math.random() * 0.9 + 0.3
}

function getRandomRotation() {
  return Math.random() * 4 - 2 // Reduced from 8 to 4
}

function getRandomScale() {
  return Math.random() * 0.05 + 0.975 // Reduced from 0.1 to 0.05
}

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
  )
}

const Firework = () => (
  <motion.div
    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
    initial={{ scale: 0 }}
    animate={{
      scale: [0, 1.5, 0],
      opacity: [1, 1, 0],
      x: [0, (Math.random() - 0.5) * 300],
      y: [0, (Math.random() - 0.5) * 300 - 100], // Subtract 100 to start higher
    }}
    transition={{ 
      duration: 1.5, // Increased duration for slower animation
      ease: [0.45, 0, 0.55, 1], // Custom cubic-bezier curve for gravitational effect
    }}
  />
)

interface Token {
  symbol: string;
  name: string;
  createdAt: Date;
  address: string;
  iconUrl: string;
  supply: string;
  color?: string;
}

export default function CoinsGrid({ tokens }: { 
  tokens: Token[] | undefined;
}) {
  const [basket, setBasket] = useState<Token[]>([]);
  const [isBasketAnimating, setIsBasketAnimating] = useState(false);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  const addToBasket = (token: Token) => {
    setBasket(prev => [...prev, token]);
    setIsBasketAnimating(true);
    setTimeout(() => setIsBasketAnimating(false), 1500); // Increased timeout to match new animation duration
  };

  if (tokens === undefined) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(12)].map((_, index) => (
            <Card key={index} className="group overflow-hidden animate-pulse">
              <CardContent className="p-0 relative aspect-square">
                <img src="/placeholder.svg" alt="Loading" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <FrownIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No tokens found</h2>
        <p className="text-gray-500">It looks like there are no tokens available at the moment.</p>
      </div>
    );
  }

  function handleBasketSelection(item: string): void {
    
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-end mb-4">
        <AnimatePresence>
          <motion.div
            className="relative cursor-pointer"
            animate={isBasketAnimating ? { scale: [1, 1.1, 1] } : {}} // Reduced from 1.2 to 1.1
            transition={{ duration: 0.3 }}
            onClick={() => setIsBasketOpen(true)}
          >
            <ShoppingCart className="w-8 h-8" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {basket.length}
            </span>
            {isBasketAnimating && (
              <>
                {[...Array(25)].map((_, index) => (
                  <Firework key={index} />
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tokens.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1).map(coin => ({ ...coin, color: getRandomColor() })).map(coin => (
          <motion.div
            key={coin.symbol}
            className="relative overflow-hidden"
            initial={{
              rotate: getRandomRotation(),
              scale: getRandomScale(),
            }}
            whileHover={{
              rotate: [0, 2, -2, 2, -2, 1, -1, 0], // Reduced rotation angles
              scale: [1, 0.975, 1.025, 0.975, 1.025, 1], // Reduced scale values
              transition: { duration: 0.3, repeat: Infinity },
            }}
          >
            <MovingBorder color={coin.color} speed={getRandomSpeed()} />
            <motion.div>
              <Card className="group overflow-hidden relative z-10 bg-background m-[4px]">
                <CardContent className="p-0 relative aspect-square">
                  <Link href={`/token/${coin.address}`}>
                    <img src={coin.iconUrl} alt={`${coin.name} logo`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /> {/* Reduced scale from 110% to 105% */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-white text-lg font-bold mb-1 group-hover:invisible">{coin.symbol}</h3>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 translate-y-2 group-hover:translate-y-0"> {/* Reduced translate-y from 4 to 2 */}
                      <h3 className="text-white text-lg font-bold mb-1">{coin.symbol}</h3>
                      <p className="text-white text-sm mb-2 line-clamp-2">{coin.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-semibold">
                          {coin.supply} XRD
                        </span>
                      </div>
                    </div>
                  </Link>
                  <Button 
                    className="absolute top-2 right-2 z-20 p-0 bg-transparent hover:bg-transparent w-8 h-8"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      addToBasket(coin);
                      console.log(`Added ${coin.symbol} to basket`);
                    }}
                  >
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <Dialog open={isBasketOpen} onOpenChange={setIsBasketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Try your luck</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Roulette items={basket} onSelect={handleBasketSelection}></Roulette>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
