"use client"

import { useAppStore } from "@/lib/store"
import { Home, Search, PlusCircle, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "home", icon: Home, label: "Home", screen: "welcome" as const },
  { id: "browse", icon: Search, label: "Browse", screen: "finder-browse" as const },
  { id: "list", icon: PlusCircle, label: "List", screen: "giver-upload" as const },
  { id: "activity", icon: Bell, label: "Activity", screen: "my-reservations" as const },
  { id: "profile", icon: User, label: "Profile", screen: "my-listings" as const },
]

export function BottomNav() {
  const { screen, setScreen, setRole, chopes, listings, sessionUserId } =
    useAppStore()
  const interestOnMyListingsCount = chopes.filter((c) => {
    const listing = listings.find((l) => l.id === c.listingId)
    return listing?.ownerId === sessionUserId
  }).length

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === "browse") {
      setRole("finder")
    } else if (item.id === "list") {
      setRole("giver")
    }
    setScreen(item.screen)
  }

  const hideOnScreens = ["welcome", "role-select"]
  if (hideOnScreens.includes(screen)) return null

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-min pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] pt-2">
        <div className="flex h-14 items-center justify-around gap-2 rounded-full border border-border bg-card/95 px-4 shadow-lg backdrop-blur-md sm:px-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            screen === item.screen ||
            (item.id === "browse" && screen.startsWith("finder")) ||
            (item.id === "list" && screen.startsWith("giver"))

          return (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleNavClick(item)}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.id === "activity" && interestOnMyListingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {interestOnMyListingsCount > 9 ? "9+" : interestOnMyListingsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
