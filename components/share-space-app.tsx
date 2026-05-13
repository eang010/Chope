"use client"

import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { RoleSelectScreen } from "@/components/screens/role-select-screen"
import { FinderBrowseScreen } from "@/components/screens/finder-browse-screen"
import { GiverUploadScreen } from "@/components/screens/giver-upload-screen"
import { GiverDetailsScreen } from "@/components/screens/giver-details-screen"
import { GiverAvailabilityScreen } from "@/components/screens/giver-availability-screen"
import { GiverLocationScreen } from "@/components/screens/giver-location-screen"
import { GiverPreviewScreen } from "@/components/screens/giver-preview-screen"
import { GiverSuccessScreen } from "@/components/screens/giver-success-screen"
import { MyReservationsScreen } from "@/components/screens/my-reservations-screen"
import { MyListingsScreen } from "@/components/screens/my-listings-screen"
import { UrgentBanner } from "@/components/urgent-banner"
import { BottomNav } from "@/components/bottom-nav"
import { PocAccountSwitcher } from "@/components/poc-account-switcher"

const HIDE_BOTTOM_NAV_SCREENS = new Set(["welcome"])

export function ShareSpaceApp() {
  const screen = useAppStore((state) => state.screen)
  const showBottomNav = !HIDE_BOTTOM_NAV_SCREENS.has(screen)

  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return <WelcomeScreen />
      case "role-select":
        return <RoleSelectScreen />
      case "finder-browse":
        return <FinderBrowseScreen />
      case "giver-upload":
        return <GiverUploadScreen />
      case "giver-details":
        return <GiverDetailsScreen />
      case "giver-availability":
        return <GiverAvailabilityScreen />
      case "giver-location":
        return <GiverLocationScreen />
      case "giver-preview":
        return <GiverPreviewScreen />
      case "giver-success":
        return <GiverSuccessScreen />
      case "my-reservations":
        return <MyReservationsScreen />
      case "my-listings":
        return <MyListingsScreen />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      {screen !== "welcome" && <PocAccountSwitcher variant="dock" />}
      <UrgentBanner />
      <main
        className={cn(
          "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden pt-[env(safe-area-inset-top,0px)]",
          screen === "finder-browse"
            ? "overflow-y-hidden"
            : "overflow-y-auto",
          showBottomNav &&
            (screen === "finder-browse"
              ? "pb-0"
              : "pb-[calc(env(safe-area-inset-bottom,0px)+5.75rem)]")
        )}
      >
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  )
}
