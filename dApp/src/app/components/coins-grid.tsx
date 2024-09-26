"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FrownIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`
}

function getRandomSpeed() {
  return Math.random() * 0.9 + 0.3
}

function getRandomRotation() {
  return Math.random() * 8 - 4
}

function getRandomScale() {
  return Math.random() * 0.1 + 0.95
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

export default function CoinsGrid({ tokens }: { 
  tokens: {
    symbol: string;
    name: string;
    createdAt: Date;
    address: string;
    iconUrl: string;
    supply: string;
  }[] | undefined;
}) {
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

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tokens.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1).map(coin => (
          <motion.div
            key={coin.symbol}
            className="relative overflow-hidden"
            initial={{
              rotate: getRandomRotation(),
              scale: getRandomScale(),
            }}
            whileHover={{
              rotate: [0, 4, -4, 4, -4, 2, -2, 0],
              scale: [1, 0.95, 1.05, 0.95, 1.05, 1],
              transition: { duration: 0.3, repeat: Infinity },
            }}
          >
            <MovingBorder color={getRandomColor()} speed={getRandomSpeed()} />
            <motion.div>
              <Card className="group overflow-hidden relative z-10 bg-background m-[4px]">
                <CardContent className="p-0 relative aspect-square">
                  <Link href={`/token/${coin.address}`}>
                    <img src={coin.iconUrl} alt={`${coin.name} logo`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-white text-lg font-bold mb-1 group-hover:invisible">{coin.symbol}</h3>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 translate-y-4 group-hover:translate-y-0">
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
                      // Add to basket logic here
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
    </div>
  )
}
