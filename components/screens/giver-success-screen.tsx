"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, Search, Bell } from "lucide-react"
import Confetti from "react-confetti"
import { useEffect, useLayoutEffect, useState } from "react"

function readViewport() {
  if (typeof window === "undefined") return { width: 0, height: 0 }
  return { width: window.innerWidth, height: window.innerHeight }
}

export function GiverSuccessScreen() {
  const { setScreen, setRole } = useAppStore()
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState(readViewport)

  useLayoutEffect(() => {
    setWindowSize(readViewport())
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleBrowse = () => {
    setRole("finder")
    setScreen("finder-categories")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
      {showConfetti &&
        windowSize.width > 0 &&
        windowSize.height > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={["#22c55e", "#84cc16", "#eab308", "#f97316"]}
        />
      )}

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
          <CheckCircle className="w-14 h-14 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Listing Published!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you for contributing to a sustainable workplace
          </p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bell className="w-4 h-4" />
            <span className="font-medium text-foreground">What happens next?</span>
          </div>
          <p>
            Interested colleagues will send you a request to reserve. 
            You can accept or reject from your listings page.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            onClick={() => setScreen("giver-upload")}
          >
            <Plus className="w-5 h-5 mr-2" />
            List Another Item
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            onClick={handleBrowse}
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Listings
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setScreen("welcome")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
