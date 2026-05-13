"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, MapPin, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlowProgressTracker } from "@/components/flow-progress-tracker"

const commonLocations = [
  "Level 1, Lobby",
  "Level 2, Pantry",
  "Level 3, Meeting Room Area",
  "Level 5, Open Office",
  "Level 8, Block A",
  "Level 10, Block B",
  "Basement 1, Storage",
]

export function GiverLocationScreen() {
  const { setScreen, updateNewListing, newListing } = useAppStore()
  const [location, setLocation] = useState(newListing.location || "")
  const [customLocation, setCustomLocation] = useState("")

  const handleSelectLocation = (loc: string) => {
    setLocation(loc)
    setCustomLocation("")
  }

  const handleCustomLocation = (value: string) => {
    setCustomLocation(value)
    setLocation(value)
  }

  const handleContinue = () => {
    updateNewListing({ location })
    setScreen("giver-preview")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:py-8 bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("giver-availability")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <FlowProgressTracker currentStep={4} totalSteps={5} className="mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Where can it be collected?
          </h2>
          <p className="text-muted-foreground">
            Help finders locate your item easily
          </p>
        </div>

        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Choose a location
            </Label>
            <div className="space-y-2">
              {commonLocations.map((loc) => (
                <button
                  key={loc}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left",
                    location === loc && !customLocation
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleSelectLocation(loc)}
                >
                  <span className="text-sm">{loc}</span>
                  {location === loc && !customLocation && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or enter custom
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom location</Label>
            <Input
              placeholder="e.g., Level 6, Near the lift lobby"
              value={customLocation}
              onChange={(e) => handleCustomLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            disabled={!location.trim()}
            onClick={handleContinue}
          >
            Preview Listing
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
