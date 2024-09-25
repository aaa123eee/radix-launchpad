import { Card, CardContent } from "@/components/ui/card"
import { XIcon, FrownIcon } from "lucide-react";
import Link from "next/link";

export default function CoinsGrid({ tokens }: { 
  tokens: {
    symbol: string;
    name: string;
    createdAt: Date;
    address: string;
    iconUrl: string;
    supply: number;
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
          <Link href={`/token/${coin.address}`} key={coin.symbol}>
            <Card className="group overflow-hidden">
              <CardContent className="p-0 relative aspect-square">
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
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}