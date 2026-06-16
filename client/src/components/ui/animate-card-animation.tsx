"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"

interface Card {
  id: number
  contentType: 1 | 2 | 3
}

const cardData = {
  1: {
    title: "Premium Nigiri",
    description: "Chef's selection of fresh sliced fish over hand-pressed sushi rice.",
    image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=80",
  },
  2: {
    title: "Dragon Rolls",
    description: "Tempura shrimp, eel, and cucumber topped with avocado and sweet glaze.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  },
  3: {
    title: "Shio Ramen",
    description: "Traditional light sea salt broth served with hand-pulled noodles and chashu pork.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  },
}

const initialCards: Card[] = [
  { id: 1, contentType: 1 },
  { id: 2, contentType: 2 },
  { id: 3, contentType: 3 },
]

const positionStyles = [
  { scale: 1, y: 12 },
  { scale: 0.95, y: -16 },
  { scale: 0.9, y: -44 },
]

const exitAnimation = {
  y: 340,
  scale: 1,
  zIndex: 10,
}

const enterAnimation = {
  y: -16,
  scale: 0.9,
}

function CardContent({ contentType }: { contentType: 1 | 2 | 3 }) {
  const data = cardData[contentType]

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="-outline-offset-1 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-xl outline outline-black/10 dark:outline-white/10">
        <img
          src={data.image || "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80"}
          alt={data.title}
          className="h-full w-full select-none object-cover"
        />
      </div>
      <div className="flex w-full items-center justify-between gap-2 px-3 pb-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold text-gray-900 dark:text-white">{data.title}</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs truncate">{data.description}</span>
        </div>
        <button className="flex h-10 shrink-0 cursor-pointer select-none items-center gap-0.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white pl-4 pr-3 text-sm font-medium transition-colors">
          Read
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function AnimatedCard({
  card,
  index,
  isAnimating,
}: {
  card: Card
  index: number
  isAnimating: boolean
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2]
  const zIndex = index === 0 && isAnimating ? 10 : 3 - index

  const exitAnim = index === 0 ? exitAnimation : undefined
  const initialAnim = index === 2 ? enterAnimation : undefined

  return (
    <motion.div
      key={card.id}
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{
        type: "spring",
        duration: 1,
        bounce: 0,
      }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        bottom: 0,
      }}
      className="absolute flex h-[280px] w-[324px] items-center justify-center overflow-hidden rounded-t-xl border-x border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1 shadow-lg will-change-transform sm:w-[512px]"
    >
      <CardContent contentType={card.contentType} />
    </motion.div>
  )
}

export default function AnimatedCardStack() {
  const [cards, setCards] = useState(initialCards)
  const [isAnimating, setIsAnimating] = useState(false)
  const [nextId, setNextId] = useState(4)

  const handleAnimate = () => {
    setIsAnimating(true)

    const nextContentType = ((cards[2].contentType % 3) + 1) as 1 | 2 | 3

    setCards([...cards.slice(1), { id: nextId, contentType: nextContentType }])
    setNextId((prev) => prev + 1)
    setIsAnimating(false)
  }

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative h-[380px] w-full overflow-hidden sm:w-[644px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 3).map((card, index) => (
            <AnimatedCard key={card.id} card={card} index={index} isAnimating={isAnimating} />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-gray-200 dark:border-gray-800 py-4">
        <button
          onClick={handleAnimate}
          className="flex h-9 cursor-pointer select-none items-center justify-center gap-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-850 px-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]"
        >
          Animate
        </button>
      </div>
    </div>
  )
}
