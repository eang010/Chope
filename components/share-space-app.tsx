"use client"

import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { RoleSelectScreen } from "@/components/screens/role-select-screen"
import { FinderCategoriesScreen } from "@/components/screens/finder-categories-screen"
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

const HIDE_BOTTOM_NAV_SCREENS = new Set(["welcome", "role-select"])

export function ShareSpaceApp() {
  const screen = useAppStore((state) => state.screen)
  const showBottomNav = !HIDE_BOTTOM_NAV_SCREENS.has(screen)

  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return <WelcomeScreen />
      case "role-select":
        return <RoleSelectScreen />
      case "finder-categories":
        return <FinderCategoriesScreen />
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
    <div className="relative flex min-h-dvh min-h-[100dvh] flex-col bg-background">
      {screen !== "welcome" && <PocAccountSwitcher variant="dock" />}
      <UrgentBanner />
      <main
        className={cn(
          "w-full min-h-0 flex-1 pt-[env(safe-area-inset-top,0px)]",
          showBottomNav &&
            "pb-[calc(env(safe-area-inset-bottom,0px)+7rem)]"
        )}
      >
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  )
}
