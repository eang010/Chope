"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { datetimeLocalFromStored, listingDatetimeForStorage, formatListingDatetimeDisplay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FlowProgressTracker } from "@/components/flow-progress-tracker"

export function GiverAvailabilityScreen() {
  const { setScreen, updateNewListing, newListing } = useAppStore()
  const today = new Date().toISOString().split("T")[0]
  const minFrom = `${today}T00:00`

  const [availableFrom, setAvailableFrom] = useState(() => {
    const v = datetimeLocalFromStored(newListing.availableFrom, "from")
    if (v) return v
    return `${today}T09:00`
  })
  const [availableUntil, setAvailableUntil] = useState(() => {
    const v = datetimeLocalFromStored(newListing.availableUntil, "until")
    if (v) return v
    if (newListing.isUrgent) return `${today}T18:00`
    return ""
  })

  const isUrgent = newListing.isUrgent

  const handleContinue = () => {
    const from = availableFrom.trim()
    if (!from) return
    const until = availableUntil.trim()
    if (isUrgent && !until) return
    updateNewListing({
      availableFrom: listingDatetimeForStorage(from),
      availableUntil: until ? listingDatetimeForStorage(until) : undefined,
    })
    setScreen("giver-location")
  }

  const untilMin = availableFrom.trim() || minFrom
  const continueDisabled =
    !availableFrom.trim() || (isUrgent && !availableUntil.trim())

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:py-8 bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("giver-details")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <FlowProgressTracker currentStep={3} totalSteps={5} className="mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            When is it available?
          </h2>
          <p className="text-muted-foreground">
            Set the collection window for your item
          </p>
        </div>

        <div className="space-y-5 flex-1">
          {isUrgent ? (
            <Card className="bg-destructive/10 border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-sm">Urgent Collection</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  This listing needs to be collected today. Set the pickup time
                  window.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgent-from">Available from</Label>
                    <Input
                      id="urgent-from"
                      type="datetime-local"
                      value={availableFrom}
                      min={minFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgent-until">Must collect by</Label>
                    <Input
                      id="urgent-until"
                      type="datetime-local"
                      value={availableUntil}
                      min={untilMin}
                      onChange={(e) => setAvailableUntil(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label className="text-muted-foreground">Selected window</Label>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {`${formatListingDatetimeDisplay(availableFrom)} → ${formatListingDatetimeDisplay(availableUntil)}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="giver-from">Available from</Label>
                <Input
                  id="giver-from"
                  type="datetime-local"
                  value={availableFrom}
                  min={minFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="giver-until">Available until (optional)</Label>
                <Input
                  id="giver-until"
                  type="datetime-local"
                  value={availableUntil}
                  min={untilMin}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {availableUntil.trim()
                    ? `Selected: ${formatListingDatetimeDisplay(availableUntil)}`
                    : "Leave empty if there’s no deadline"}
                </p>
              </div>
            </>
          )}

          <Card className="bg-secondary/50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Tips for availability</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Be realistic about when you can meet</li>
                <li>• Consider lunch breaks or after-work hours</li>
                <li>• You can always update this later</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-auto pt-6">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            onClick={handleContinue}
            disabled={continueDisabled}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
