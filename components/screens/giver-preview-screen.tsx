"use client"

import { useAppStore, type Category } from "@/lib/store"
import { getPocUser } from "@/lib/poc-users"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, User, Edit2, Send, AlertTriangle } from "lucide-react"
import { FlowProgressTracker } from "@/components/flow-progress-tracker"

export function GiverPreviewScreen() {
  const { setScreen, newListing, addListing, resetNewListing, sessionUserId } =
    useAppStore()

  const sessionUser = getPocUser(sessionUserId)

  const handlePublish = () => {
    const user = getPocUser(sessionUserId)
    if (!user) return
    const qty = Math.max(
      1,
      Math.floor(newListing.quantity ?? 1)
    )
    const listing = {
      id: Date.now().toString(),
      title: newListing.title!,
      description: newListing.description!,
      category: newListing.category!,
      images: newListing.images || ["/placeholder.svg?height=400&width=400"],
      location: newListing.location!,
      availableFrom: newListing.availableFrom!,
      availableUntil: newListing.availableUntil,
      ownerId: user.id,
      ownerName: user.displayName,
      ownerDepartment: user.department,
      isUrgent: newListing.isUrgent || false,
      createdAt: new Date().toISOString(),
      status: "available" as const,
      quantity: qty,
      archived: false,
    }

    addListing(listing)
    resetNewListing()
    setScreen("giver-success")
  }

  const getCategoryEmoji = (cat: Category) => {
    switch (cat) {
      case "food":
        return "🍱"
      case "merch":
        return "👕"
      case "electronics":
        return "💻"
      case "open-jio":
        return "👥"
      case "other":
        return "📦"
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("giver-location")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <FlowProgressTracker currentStep={5} totalSteps={5} className="mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Preview your listing
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s how it will appear to other users
          </p>
        </div>

        <Card className="overflow-hidden shadow-lg mb-6">
          <div className="relative aspect-video bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {getCategoryEmoji(newListing.category ?? "other")}
                </div>
                <p className="text-sm text-muted-foreground">Image Preview</p>
              </div>
            </div>
            {newListing.isUrgent && (
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
            <Badge variant="secondary" className="absolute top-3 right-3 capitalize">
              {newListing.category}
            </Badge>
          </div>

          <CardContent className="p-5">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {newListing.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {newListing.description}
            </p>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Up to{" "}
                <span className="font-medium text-foreground">
                  {Math.max(1, Math.floor(newListing.quantity ?? 1))}
                </span>{" "}
                people can Chope before this hides from browse.
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{newListing.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Available from {newListing.availableFrom}
                  {newListing.availableUntil && ` until ${newListing.availableUntil}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>
                  Listed by {sessionUser?.displayName ?? "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {newListing.isUrgent && (
          <Card className="bg-destructive/10 border-destructive/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Urgent Broadcast</h4>
                  <p className="text-xs text-muted-foreground">
                    This listing will be shown as a banner notification to all users 
                    currently in the app, and push notifications will be sent to those 
                    who have enabled them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 mt-auto">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            onClick={handlePublish}
          >
            <Send className="w-5 h-5 mr-2" />
            Publish Listing
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setScreen("giver-details")}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  )
}