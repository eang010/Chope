"use client"

import { useState, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, MessageCircle, Hand, Undo2 } from "lucide-react"

export function MyReservationsScreen() {
  const { setScreen, chopes, listings, releaseChope, sessionUserId } =
    useAppStore()
  const [releaseChopeId, setReleaseChopeId] = useState<string | null>(null)

  const myChopes = useMemo(
    () => chopes.filter((c) => c.requesterId === sessionUserId),
    [chopes, sessionUserId]
  )

  const getListing = (listingId: string) => listings.find((l) => l.id === listingId)

  const releaseTarget = releaseChopeId
    ? myChopes.find((c) => c.id === releaseChopeId)
    : null
  const releaseListing = releaseTarget
    ? getListing(releaseTarget.listingId)
    : null

  const confirmRelease = () => {
    if (releaseChopeId) {
      releaseChope(releaseChopeId)
    }
    setReleaseChopeId(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background px-6 py-8 pb-6">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("welcome")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h2 className="text-2xl font-bold text-foreground mb-2">Activity</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Listings you&apos;ve choped. Use{" "}
        <strong>Release</strong> if you change your mind—it frees your <strong>Chope</strong> so
        someone else can.
      </p>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          My chopes ({myChopes.length})
        </h3>

        {myChopes.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">
                You haven&apos;t choped anything yet. Browse and tap Chope when
                you want something.
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setScreen("finder-browse")}
              >
                Browse listings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myChopes.map((c) => {
              const listing = getListing(c.listingId)
              if (!listing) return null

              return (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm">{listing.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {listing.ownerName} · {listing.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        <Hand className="w-3 h-3 mr-1" />
                        Choped
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                    {c.message && (
                      <div className="bg-muted rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">{c.message}</p>
                        </div>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setReleaseChopeId(c.id)}
                    >
                      <Undo2 className="w-4 h-4 mr-2" />
                      Release
                    </Button>
               
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={releaseChopeId !== null}
        onOpenChange={(open) => {
          if (!open) setReleaseChopeId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release this Chope?</AlertDialogTitle>
            <AlertDialogDescription>
              {releaseListing ? (
                <>
                  This removes your Chope on{" "}
                  <span className="font-medium text-foreground">
                    {releaseListing.title}
                  </span>
                  . The giver will see one fewer person in their list, and a slot
                  opens up again for finders.
                </>
              ) : (
                "This removes your Chope and frees a slot on that listing."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRelease}>Release</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
