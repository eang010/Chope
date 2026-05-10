"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FlowProgressTracker } from "@/components/flow-progress-tracker"

export function GiverAvailabilityScreen() {
  const { setScreen, updateNewListing, newListing } = useAppStore()
  const today = new Date().toISOString().split("T")[0]

  const [dateFrom, setDateFrom] = useState(() => {
    const raw = newListing.availableFrom?.trim()
    if (!raw) return today
    if (raw.includes("T")) return raw.split("T")[0]
    return raw
  })
  const [timeFrom, setTimeFrom] = useState(() => {
    const raw = newListing.availableFrom?.trim()
    if (!raw) return "09:00"
    if (!raw.includes("T")) return "09:00"
    const timePart = raw.split("T")[1]?.replace(/Z$/i, "") ?? ""
    return timePart.slice(0, 5) || "09:00"
  })

  const [dateUntil, setDateUntil] = useState(() => {
    const raw = newListing.availableUntil?.trim()
    if (!raw) return ""
    if (raw.includes("T")) return raw.split("T")[0]
    return raw
  })
  const [timeUntil, setTimeUntil] = useState(() => {
    const raw = newListing.availableUntil?.trim()
    if (!raw) return "18:00"
    if (!raw.includes("T")) return "18:00"
    const timePart = raw.split("T")[1]?.replace(/Z$/i, "") ?? ""
    return timePart.slice(0, 5) || "18:00"
  })

  const isUrgent = newListing.isUrgent

  const handleContinue = () => {
    const availableFrom = `${dateFrom}T${timeFrom}`
    const availableUntil = dateUntil ? `${dateUntil}T${timeUntil}` : undefined
    updateNewListing({
      availableFrom,
      availableUntil,
    })
    setScreen("giver-location")
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
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
                  This listing needs to be collected today. Set the pickup time window.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value)
                        setDateUntil(e.target.value)
                      }}
                      min={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Must collect by
                    </Label>
                    <Input
                      type="time"
                      value={timeUntil}
                      onChange={(e) => setTimeUntil(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Available from
                    </Label>
                    <Input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Selected window
                    </Label>
                    <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                      {`${dateFrom} ${timeFrom} – ${dateFrom} ${timeUntil}`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Available from
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    min={today}
                  />
                  <Input
                    type="time"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {dateFrom} {timeFrom}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Available until (optional)
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={dateUntil}
                    onChange={(e) => setDateUntil(e.target.value)}
                    min={dateFrom}
                  />
                  <Input
                    type="time"
                    value={timeUntil}
                    onChange={(e) => setTimeUntil(e.target.value)}
                    disabled={!dateUntil}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {dateUntil
                    ? `Selected: ${dateUntil} ${timeUntil}`
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
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
