import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { TwitterIcon, UploadIcon, PlusIcon } from 'lucide-react'

import { type Token } from "@prisma/client";

export default function CoinsGrid({ tokens }: { tokens: {
    symbol: string;
    name: string;
    createdAt: Date;
    address: string;
    iconUrl: string;
    supply: number;
}[] }) {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tokens.map(coin => (
          <Card key={coin.symbol} className="group overflow-hidden">
            <CardContent className="p-0 relative aspect-square">
              <img src={coin.iconUrl} alt={`${coin.name} logo`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white text-lg font-bold mb-1">{coin.symbol}</h3>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 translate-y-4 group-hover:translate-y-0">
                <h3 className="text-white text-lg font-bold mb-1">{coin.name}</h3>
                <p className="text-white text-sm mb-2 line-clamp-2">{coin.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs flex items-center">
                    <TwitterIcon className="h-3 w-3 mr-1" />
                    {coin.twitter}
                  </span>
                  <span className="text-white text-xs font-semibold">
                    {coin.investment} XRD
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}