"use client"

import {
  listUrgentBannerCandidates,
  useAppStore,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"

const SWIPE_THRESHOLD_PX = 48

export function UrgentBanner() {
  const listings = useAppStore((s) => s.listings)
  const chopes = useAppStore((s) => s.chopes)
  const urgentFeaturedId = useAppStore((s) => s.urgentFeaturedId)
  const dismissUrgentBanner = useAppStore((s) => s.dismissUrgentBanner)
  const goNextUrgentBanner = useAppStore((s) => s.goNextUrgentBanner)
  const goPrevUrgentBanner = useAppStore((s) => s.goPrevUrgentBanner)
  const setUrgentFeaturedBannerIndex = useAppStore(
    (s) => s.setUrgentFeaturedBannerIndex
  )
  const setScreen = useAppStore((s) => s.setScreen)
  const setRole = useAppStore((s) => s.setRole)
  const toggleCategory = useAppStore((s) => s.toggleCategory)
  const selectedCategories = useAppStore((s) => s.selectedCategories)

  const candidates = useMemo(
    () => listUrgentBannerCandidates(listings, chopes),
    [listings, chopes]
  )

  const featured = useMemo(() => {
    if (urgentFeaturedId == null) return null
    return candidates.find((l) => l.id === urgentFeaturedId) ?? null
  }, [candidates, urgentFeaturedId])

  const featuredIndex = featured
    ? candidates.findIndex((l) => l.id === featured.id)
    : -1

  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (featured) {
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
    setIsVisible(false)
  }, [featured])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartX.current
      touchStartX.current = null
      if (start == null || candidates.length <= 1) return
      const end = e.changedTouches[0]?.clientX
      if (end == null) return
      const dx = end - start
      if (dx > SWIPE_THRESHOLD_PX) goPrevUrgentBanner()
      else if (dx < -SWIPE_THRESHOLD_PX) goNextUrgentBanner()
    },
    [candidates.length, goNextUrgentBanner, goPrevUrgentBanner]
  )

  if (!featured || !isVisible) return null

  const showDots = candidates.length > 1

  const handleViewListing = () => {
    setRole("finder")
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(featured.category)
    ) {
      toggleCategory(featured.category)
    }
    setScreen("finder-browse")
    dismissUrgentBanner()
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => dismissUrgentBanner(), 300)
  }

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="bg-destructive pt-[env(safe-area-inset-top,0px)] text-destructive-foreground">
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive-foreground/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div
              className="flex-1 min-w-0 relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm">
                  Grab It Before It&apos;s Gone!
                </h4>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1 hover:bg-destructive-foreground/20 rounded-full transition-colors shrink-0"
                  aria-label="Dismiss urgent banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p
                className="text-sm opacity-100 line-clamp-1 mt-1 mb-2"
                aria-live="polite"
              >
                {featured.title}
              </p>

              {isExpanded && (
                <div className="space-y-2 mb-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm opacity-80">{featured.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs opacity-80">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {featured.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Same-day pickup
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                    onClick={handleViewListing}
                  >
                    Snag It Now
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs hover:bg-destructive-foreground/20"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "Less" : "More"}
                  </Button>
                </div>
                {showDots && (
                  <div
                    className="flex items-center gap-2 ml-auto shrink-0"
                    role="tablist"
                    aria-label="Choose which urgent listing to show"
                  >
                    {candidates.map((listing, i) => {
                      const active = i === featuredIndex
                      return (
                        <button
                          key={listing.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          aria-label={`Urgent listing ${i + 1} of ${candidates.length}`}
                          onClick={() => setUrgentFeaturedBannerIndex(i)}
                          className="p-1.5 rounded-full hover:bg-destructive-foreground/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive-foreground/80"
                        >
                          <span
                            className={`block size-2.5 rounded-full border border-destructive-foreground/70 ${
                              active
                                ? "bg-destructive-foreground"
                                : "bg-transparent"
                            }`}
                            aria-hidden
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
