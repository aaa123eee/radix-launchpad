"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"

interface RouletteProps {
  items: Token[];
  onSelect: (item: Token) => void
}

interface Token {
    symbol: string;
    name: string;
    createdAt: Date;
    address: string;
    iconUrl: string;
    supply: string;
    color?: string;
}

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`
}

export default function Roulette({ items, onSelect }: RouletteProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Token | null>(null);
  const rouletteRef = useRef<HTMLDivElement>(null);

  const itemsWithColor = useMemo(() => 
    items.map(item => ({ ...item, color: item.color || getRandomColor() })),
    [items]
  )

  const spinRoulette = useCallback(() => {
    setSpinning(true)
    setSelectedItem(null)

    const spinDuration = 5000 // 5 seconds
    const randomRotations = Math.floor(Math.random() * 5) + 5 // 5 to 10 rotations
    const totalRotation = randomRotations * 360 + Math.floor(Math.random() * 360)

    if (rouletteRef.current) {
      rouletteRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
      rouletteRef.current.style.transform = `rotate(${totalRotation}deg)`
    }

    setTimeout(() => {
      setSpinning(false)
      const selectedIndex = Math.floor(Math.random() * itemsWithColor.length)
      const selected = itemsWithColor[selectedIndex];

      if (!selected) return;

      setSelectedItem(selected);
      onSelect(selected);
    }, spinDuration)
  }, [spinning, itemsWithColor, onSelect])

  useEffect(() => {
    const roulette = rouletteRef.current
    return () => {
      if (roulette) {
        roulette.style.transition = 'none'
        roulette.style.transform = 'none'
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary">
        <div
          ref={rouletteRef}
          className="absolute inset-0"
          style={{
            transformOrigin: 'center center',
          }}
        >
          {itemsWithColor.map((item, index) => {
            const angle = (360 / itemsWithColor.length) * index;
            const nextAngle = (360 / itemsWithColor.length) * (index + 1);
            return (
              <div
                key={item.name}
                className="absolute inset-[-10%]"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 60 * Math.cos(angle * Math.PI / 180)}% ${50 + 60 * Math.sin(angle * Math.PI / 180)}%, ${50 + 60 * Math.cos(nextAngle * Math.PI / 180)}% ${50 + 60 * Math.sin(nextAngle * Math.PI / 180)}%)`,
                  backgroundColor: item.color,
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle + (360 / itemsWithColor.length / 2)}deg)`,
                  }}
                >
                  <div
                    className="text-xs font-bold text-white whitespace-nowrap px-2 py-1 bg-black bg-opacity-30 rounded max-w-[80%] overflow-hidden text-center"
                    style={{
                      transform: `rotate(-${angle + (360 / itemsWithColor.length / 2)}deg)`,
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute top-0 left-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[16px] border-t-primary transform -translate-x-1/2 z-10" />
      </div>
      <Button onClick={spinRoulette} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin'}
      </Button>
      {selectedItem && (
        <div className="text-lg font-semibold">You are about to become a happy owner of <h1>!!! {selectedItem.name} !!!</h1></div>
      )}
    </div>
  )
}