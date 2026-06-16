import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"

interface Card {
  id: number
  contentType: 1 | 2 | 3 | 4
}

const cardData = {
  1: {
    tag: "Chef's Recommendation",
    title: "Premium Nigiri",
    description: "Hand-pressed sushi rice topped with the finest cuts of bluefin tuna and fresh Atlantic salmon.",
    video: "/videos/always-fresh.mp4",
    feedback: "The best sushi I've ever had outside of Tokyo. Absolutely melt-in-your-mouth!",
    author: "Elena S.",
  },
  2: {
    tag: "Top Rated",
    title: "Dragon Rolls",
    description: "A fan favorite. Crispy tempura shrimp wrapped in velvety avocado with our signature eel sauce.",
    video: "/videos/fast-delivery.mp4",
    feedback: "Always arrives piping hot and beautifully presented. My go-to Friday night treat!",
    author: "Marcus J.",
  },
  3: {
    tag: "Authentic Taste",
    title: "Shio Ramen",
    description: "Light, clear broth seasoned with salt, served with handmade noodles and tender chashu pork.",
    video: "/videos/secure-payment.mp4",
    feedback: "The broth is so deep and flavorful. It reminds me of the hidden ramen shops in Osaka.",
    author: "Kenji T.",
  },
  4: {
    tag: "Customer Favorite",
    title: "Spicy Maki",
    description: "Finely chopped spicy tuna or yellowtail with cucumber and spicy mayo for a perfect kick.",
    video: "/videos/support-center.mp4",
    feedback: "Perfectly balanced heat. I order this every single time I visit. Highly recommended!",
    author: "Sarah L.",
  },
}

// Position styles for the "stack" effect when it's shrunk
const positionStyles = [
  { scale: 1, y: 0 },
  { scale: 0.9, y: -20 },
  { scale: 0.8, y: -40 },
]

const exitAnimation = {
  y: 500,
  scale: 1,
  opacity: 0,
  zIndex: 10,
}

const enterAnimation = {
  y: -50,
  scale: 0.8,
  opacity: 0,
}

function CardContent({ contentType }: { contentType: 1 | 2 | 3 | 4 }) {
  const data = cardData[contentType]

  return (
    <div className="relative h-full w-full overflow-hidden">
      <video 
        src={data.video}
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-8 md:p-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs md:text-sm font-bold uppercase tracking-widest rounded-full mb-6">
            {data.tag}
          </span>
          
          <h3 className="text-5xl md:text-9xl font-black text-white uppercase italic tracking-tighter mb-6 drop-shadow-2xl">
            {data.title}
          </h3>
          
          <p className="text-gray-200 text-lg md:text-2xl font-medium max-w-3xl mx-auto mb-10 drop-shadow-md">
            {data.description}
          </p>

          {/* Feedback Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto mb-10 transform -rotate-1 shadow-2xl">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-white text-lg md:text-xl italic font-medium leading-relaxed mb-4">
              "{data.feedback}"
            </p>
            <div className="text-orange-400 font-bold uppercase tracking-widest text-sm">
              — {data.author}
            </div>
          </div>

          <button className="group flex items-center gap-3 bg-white text-black hover:bg-orange-500 hover:text-white px-10 py-5 rounded-full text-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-2xl">
            View Recommendations
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

function AnimatedCard({
  card,
  index,
}: {
  card: Card
  index: number
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2]
  const zIndex = 3 - index

  const exitAnim = index === 0 ? exitAnimation : undefined
  const initialAnim = index === 2 ? enterAnimation : undefined

  return (
    <motion.div
      key={card.id}
      initial={initialAnim}
      animate={{ y, scale, opacity: 1 }}
      exit={exitAnim}
      transition={{
        type: "spring",
        duration: 1.2,
        bounce: 0.1,
      }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        top: 0,
      }}
      className="absolute h-full w-full items-center justify-center overflow-hidden bg-gray-900 shadow-2xl will-change-transform"
    >
      <CardContent contentType={card.contentType} />
    </motion.div>
  )
}

export default function AnimatedCardStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Track scroll progress within the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // We define steps to cycle through the 4 cards
  const totalSteps = 6

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 0 to 0.8 is the cycling phase
    const cycleProgress = Math.min(latest / 0.8, 1)
    const step = Math.min(Math.floor(cycleProgress * totalSteps), totalSteps - 1)
    if (step !== activeIndex) {
      setActiveIndex(step)
    }
  })

  // Shrink animation at the end (from 0.8 to 1.0 of scroll progress)
  const stackScale = useTransform(scrollYProgress, [0.8, 1], [1, 0.4])
  const stackY = useTransform(scrollYProgress, [0.8, 1], ["0%", "20%"])
  const stackOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])
  const stackBorderRadius = useTransform(scrollYProgress, [0.8, 0.95], ["0px", "48px"])

  // Dynamically generate the 3 visible cards
  const visibleCards = Array.from({ length: 3 }).map((_, i) => {
    const id = activeIndex + i
    const contentType = ((id % 4) + 1) as 1 | 2 | 3 | 4
    return { id, contentType }
  })

  return (
    <div ref={containerRef} className="relative h-[500vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Wrapper that handles the final shrink to center */}
        <motion.div 
          style={{ 
            scale: stackScale, 
            y: stackY, 
            opacity: stackOpacity,
            borderRadius: stackBorderRadius
          }}
          className="relative h-full w-full overflow-hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleCards.map((card, index) => (
              <AnimatedCard 
                key={card.id} 
                card={card} 
                index={index} 
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Optional scroll indicator/indicator text that fades out */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm uppercase tracking-widest font-bold flex flex-col items-center gap-4 z-[100]"
        >
          <span>Scroll to explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent"></div>
        </motion.div>
      </div>
    </div>
  )
}
