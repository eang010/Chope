"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { PocAccountSwitcher } from "@/components/poc-account-switcher"
import { Leaf, ArrowRight } from "lucide-react"

export function WelcomeScreen() {
  const setScreen = useAppStore((state) => state.setScreen)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
            Chope & Take
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Give More, Waste Less
          </p>
        </div>

        <p className="text-muted-foreground leading-relaxed text-pretty">
          Your agency&apos;s internal platform for sharing pre-loved items and surplus food.
          Reduce waste and build a culture of sustainability together.
        </p>

        <div className="pt-4 space-y-4">
          <Button
            size="lg"
            className="w-full rounded-xl py-6 text-lg group"
            onClick={() => setScreen("role-select")}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <PocAccountSwitcher variant="welcome" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">250+</p>
            <p className="text-xs text-muted-foreground">Items Shared</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">50kg</p>
            <p className="text-xs text-muted-foreground">Food Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">120+</p>
            <p className="text-xs text-muted-foreground">Happy Finders</p>
          </div>
        </div>
      </div>
    </div>
  )
}
