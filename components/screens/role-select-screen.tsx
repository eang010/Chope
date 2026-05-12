"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Gift, Search, Sparkles, Heart } from "lucide-react"

export function RoleSelectScreen() {
  const { setScreen, setRole, setCurrentListingIndex } = useAppStore()

  const handleRoleSelect = (role: "giver" | "finder") => {
    setRole(role)
    if (role === "giver") {
      setScreen("giver-upload")
    } else {
      setCurrentListingIndex(0)
      useAppStore.setState({ selectedCategories: [] })
      setScreen("finder-browse")
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-8"
        onClick={() => setScreen("welcome")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            What brings you here today?
          </h2>
          <p className="text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="space-y-4">
          <Card 
            className="cursor-pointer border-2 border-transparent hover:border-primary transition-all group"
            onClick={() => handleRoleSelect("giver")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Gift className="w-7 h-7 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">Giver</h3>
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Share your pre-loved items or surplus food with colleagues who need them
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer border-2 border-transparent hover:border-primary transition-all group"
            onClick={() => handleRoleSelect("finder")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">Finder</h3>
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Discover available items and food shared by your colleagues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          You can switch between roles anytime
        </p>
      </div>
    </div>
  )
}
