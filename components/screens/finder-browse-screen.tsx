"use client"

import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react"
import {
  useAppStore,
  listingShowsInFinderBrowse,
  getRemaining,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, User, MessageCircle, Hand } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const CAROUSEL_GAP = 16

export function FinderBrowseScreen() {
  const {
    setScreen,
    listings,
    chopes,
    sessionUserId,
    selectedCategories,
    currentListingIndex,
    setCurrentListingIndex,
    addChope,
  } = useAppStore()

  const [showReserveDialog, setShowReserveDialog] = useState(false)
  const [reserveMessage, setReserveMessage] = useState("")
  const [reserveError, setReserveError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "photos">("overview")
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselLayout, setCarouselLayout] = useState({
    containerW: 0,
    cardW: 320,
  })

  const filteredListings = useMemo(() => {
    return listings.filter((l) =>
      listingShowsInFinderBrowse(l, chopes, selectedCategories)
    )
  }, [listings, chopes, selectedCategories])

  const currentListing = filteredListings[currentListingIndex]

  const alreadyChopedCurrent =
    !!currentListing &&
    chopes.some(
      (c) =>
        c.listingId === currentListing.id && c.requesterId === sessionUserId
    )

  const remainingCurrent = currentListing
    ? getRemaining(currentListing, chopes)
    : 0

  useEffect(() => {
    setHeroPreviewUrl(null)
  }, [currentListingIndex])

  useEffect(() => {
    if (activeTab === "overview") {
      setHeroPreviewUrl(null)
    }
  }, [activeTab])

  useLayoutEffect(() => {
    const el = carouselRef.current
    if (!el) return

    const measure = () => {
      const w = el.clientWidth
      if (w === 0) return
      const cardW = Math.min(320, Math.max(260, w - 48))
      setCarouselLayout((prev) =>
        prev.containerW === w && prev.cardW === cardW
          ? prev
          : { containerW: w, cardW }
      )
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || carouselLayout.containerW === 0) return
    const { containerW, cardW } = carouselLayout
    const step = cardW + CAROUSEL_GAP
    const target = step * currentListingIndex - (containerW - cardW) / 2
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
  }, [currentListingIndex, carouselLayout])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || carouselLayout.containerW === 0) return

    const { containerW, cardW } = carouselLayout
    const step = cardW + CAROUSEL_GAP
    let scrollTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollLeft = carousel.scrollLeft
        const centerOffset = (containerW - cardW) / 2
        const centeredIndex = Math.round((scrollLeft + centerOffset) / step)
        const clampedIndex = Math.max(
          0,
          Math.min(centeredIndex, filteredListings.length - 1)
        )

        if (clampedIndex !== currentListingIndex) {
          setCurrentListingIndex(clampedIndex)
          setActiveTab("overview")
        }
      }, 50)
    }

    carousel.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      carousel.removeEventListener("scroll", handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [
    currentListingIndex,
    filteredListings.length,
    carouselLayout,
    setCurrentListingIndex,
  ])

  useEffect(() => {
    if (filteredListings.length === 0) return
    if (currentListingIndex >= filteredListings.length) {
      setCurrentListingIndex(Math.max(0, filteredListings.length - 1))
    }
  }, [filteredListings.length, currentListingIndex, setCurrentListingIndex])

  useEffect(() => {
    if (filteredListings.length === 0) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      const t = e.target as HTMLElement
      if (
        t.closest("textarea, input, [contenteditable=true], [role=dialog]")
      )
        return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCurrentListingIndex(Math.max(0, currentListingIndex - 1))
        setActiveTab("overview")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setCurrentListingIndex(
          Math.min(filteredListings.length - 1, currentListingIndex + 1)
        )
        setActiveTab("overview")
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    currentListingIndex,
    filteredListings.length,
    setCurrentListingIndex,
  ])

  const handleCardClick = (index: number) => {
    setCurrentListingIndex(index)
    setActiveTab("overview")
  }

  const handleChope = () => {
    if (!currentListing) return
    if (alreadyChopedCurrent || remainingCurrent <= 0) return
    setReserveError(null)
    setShowReserveDialog(true)
  }

  const handleSkip = () => {
    if (currentListingIndex < filteredListings.length) {
      setCurrentListingIndex(currentListingIndex + 1)
      setActiveTab("overview")
    }
  }

  const handleReserve = () => {
    if (!currentListing) return

    const ok = addChope({
      listingId: currentListing.id,
      message: reserveMessage.trim() || undefined,
    })

    if (!ok) {
      setReserveError("You’ve already choped this listing.")
      return
    }

    setShowReserveDialog(false)
    setReserveMessage("")
    setReserveError(null)
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
      setActiveTab("overview")
    }, 1500)
  }

  // Empty state
  if (filteredListings.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="self-start -ml-2 mb-4"
            onClick={() => setScreen("finder-categories")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Hand className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-6">
            No items available in your selected categories right now
          </p>
          <Button onClick={() => setScreen("finder-categories")}>
            Change Categories
          </Button>
        </div>
      </div>
    )
  }

  // All viewed state
  if (currentListingIndex >= filteredListings.length) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="self-start -ml-2 mb-4"
            onClick={() => setScreen("finder-categories")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-balance">
            {"That's all for now!"}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-[280px] text-balance">
            You&apos;ve browsed through all {filteredListings.length} available listings in your selected categories
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <Button className="w-full" onClick={() => {
              setCurrentListingIndex(0)
            }}>
              View All Listings Again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setScreen("finder-categories")}>
              Browse Other Categories
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setScreen("my-reservations")}>
              My chopes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
      {/* Header */}
      <div className="bg-background">
        <div className="px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="self-start -ml-2 mb-4"
            onClick={() => setScreen("finder-categories")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-end">
            <span className="text-sm text-muted-foreground tabular-nums">
              {currentListingIndex + 1} of {filteredListings.length}
            </span>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+4rem)] left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg animate-in fade-in slide-in-from-top-2">
          Choped! Coordinate pickup offline.
        </div>
      )}

      {/* Horizontal scroll carousel — centered on desktop, measured width on narrow screens */}
      <div className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col">
        <p className="sr-only">
          Listing carousel. Use left and right arrow keys to move between listings.
        </p>
        <div
          ref={carouselRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Browse listings"
          className="flex min-h-0 flex-1 snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain pt-6 pb-40 scrollbar-hide outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted/30"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className="flex gap-4"
            style={{
              paddingLeft: `max(1rem, calc(50% - ${carouselLayout.cardW / 2}px))`,
              paddingRight: `max(1rem, calc(50% - ${carouselLayout.cardW / 2}px))`,
            }}
          >
          {filteredListings.map((listing, index) => {
            const isActive = index === currentListingIndex
            const spotsLeft = getRemaining(listing, chopes)

            return (
              <div
                key={listing.id}
                className={cn(
                  "snap-center shrink-0 transition-all duration-300 ease-out",
                  isActive ? "z-10 scale-100 opacity-100" : "z-0 scale-90 opacity-50"
                )}
                style={{ width: carouselLayout.cardW || 320 }}
                onClick={() => handleCardClick(index)}
              >
                {/* Google Maps Style Card */}
                <Card className={cn(
                  "overflow-hidden bg-card shadow-xl cursor-pointer transition-shadow",
                  isActive && "shadow-2xl"
                )}>
                  {/* Hero Image */}
                  <div className="relative h-44 bg-muted overflow-hidden">
                    <img
                      src={
                        isActive && heroPreviewUrl
                          ? heroPreviewUrl
                          : listing.images[0]
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {listing.isUrgent && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs">
                          Urgent
                        </Badge>
                      )}
                      {listing.quantity > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {spotsLeft} left
                        </Badge>
                      )}
                    </div>
                    
                    {/* Title overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-lg font-semibold text-white line-clamp-1">
                        {listing.title}
                      </h2>
                      <p className="text-sm text-white/80">
                        {listing.ownerDepartment}
                      </p>
                    </div>
                  </div>

                  {/* Only show details for active card */}
                  {isActive && (
                    <>
                      {/* Tab Navigation */}
                      <div className="flex border-b border-border">
                        <button
                          className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors relative",
                            activeTab === "overview" 
                              ? "text-primary" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={(e) => { e.stopPropagation(); setActiveTab("overview") }}
                        >
                          Overview
                          {activeTab === "overview" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                          )}
                        </button>
                        <button
                          className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors relative",
                            activeTab === "photos" 
                              ? "text-primary" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={(e) => { e.stopPropagation(); setActiveTab("photos") }}
                        >
                          Photos
                          {activeTab === "photos" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                          )}
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-4">
                        {activeTab === "overview" ? (
                          <div className="space-y-3">
                            {/* Location Row */}
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground">{listing.location}</span>
                            </div>
                            
                            {/* Availability Row */}
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground">
                                Available from {listing.availableFrom}
                              </span>
                            </div>
                            
                            {/* Owner Row */}
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground">{listing.ownerName}</span>
                            </div>

                            {/* Description */}
                            <div className="pt-3 border-t border-border">
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {listing.description}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {listing.images.map((image, imgIndex) => {
                              const isThumbSelected = heroPreviewUrl
                                ? heroPreviewUrl === image
                                : imgIndex === 0
                              return (
                                <button
                                  key={imgIndex}
                                  type="button"
                                  className={cn(
                                    "relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 ring-offset-2 ring-offset-card transition focus:outline-none focus-visible:ring-primary",
                                    isThumbSelected
                                      ? "ring-primary"
                                      : "ring-transparent hover:ring-primary/40"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setHeroPreviewUrl(image)
                                  }}
                                >
                                  <img
                                    src={image}
                                    alt={`${listing.title} - Photo ${imgIndex + 1}`}
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                  />
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Minimal info for non-active cards */}
                  {!isActive && (
                    <div className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )
          })}
          </div>
        </div>
      </div>

      {/* Action buttons — cleared from bottom nav + home indicator */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] left-0 right-0 z-30 px-6">
        <div className="mx-auto flex max-w-sm gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-12"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            size="lg"
            className="flex-1 h-12"
            onClick={handleChope}
            disabled={
              !currentListing ||
              alreadyChopedCurrent ||
              remainingCurrent <= 0
            }
          >
            <Hand className="w-5 h-5 mr-2" />
            {alreadyChopedCurrent
              ? "Choped"
              : remainingCurrent <= 0
                ? "Full"
                : "Chope!"}
          </Button>
        </div>
      </div>

      {/* Reserve Dialog */}
      <Dialog
        open={showReserveDialog}
        onOpenChange={(open) => {
          setShowReserveDialog(open)
          if (!open) setReserveError(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chope this item</DialogTitle>
            <DialogDescription>
              Add an optional note for the giver. Arrange pickup offline—there’s
              no accept step in the app.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Textarea
              placeholder="Optional: e.g. when you can pick up…"
              value={reserveMessage}
              onChange={(e) => setReserveMessage(e.target.value)}
              className="min-h-[100px]"
            />
            {reserveError && (
              <p className="text-sm text-destructive">{reserveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReserveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReserve}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Chope
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
