"use client"

import { useAppStore, type Category } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Utensils, Shirt, Laptop, Users, Package, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const categories: { id: Category; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "food", label: "Food & Snacks", icon: <Utensils className="w-6 h-6" />, description: "Surplus meals, snacks & pantry items" },
  { id: "merch", label: "Company Merch", icon: <Shirt className="w-6 h-6" />, description: "T-shirts, plushies & corporate swag" },
  { id: "open-jio", label: "Open Jio", icon: <Users className="w-6 h-6" />, description: "Group food orders & lunch buddies" },
  { id: "electronics", label: "Electronics", icon: <Laptop className="w-6 h-6" />, description: "Gadgets, peripherals & accessories" },
  { id: "other", label: "Other Items", icon: <Package className="w-6 h-6" />, description: "Everything else" },
]

export function FinderCategoriesScreen() {
  const { setScreen, selectedCategories, toggleCategory, setCurrentListingIndex } = useAppStore()

  const handleContinue = () => {
    setCurrentListingIndex(0)
    setScreen("finder-browse")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background px-6 py-8 pb-6">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("role-select")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            What are you looking for?
          </h2>
          <p className="text-muted-foreground">
            Select one or more categories to browse
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id)
            return (
              <Card
                key={cat.id}
                className={cn(
                  "cursor-pointer transition-all border-2",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-border"
                )}
                onClick={() => toggleCategory(cat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {cat.icon}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{cat.label}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-auto">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            disabled={selectedCategories.length === 0}
            onClick={handleContinue}
          >
            Browse {selectedCategories.length > 0 ? `(${selectedCategories.length} selected)` : "Listings"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
