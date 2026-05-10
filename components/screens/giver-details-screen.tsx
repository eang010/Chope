"use client"

import { useState } from "react"
import { useAppStore, type Category } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Utensils, Shirt, Laptop, Users, Package, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlowProgressTracker } from "@/components/flow-progress-tracker"
import { Switch } from "@/components/ui/switch"

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "food", label: "Food", icon: <Utensils className="w-5 h-5" /> },
  { id: "merch", label: "Merch", icon: <Shirt className="w-5 h-5" /> },
  { id: "open-jio", label: "Open Jio", icon: <Users className="w-5 h-5" /> },
  { id: "electronics", label: "Electronics", icon: <Laptop className="w-5 h-5" /> },
  { id: "other", label: "Other", icon: <Package className="w-5 h-5" /> },
]

export function GiverDetailsScreen() {
  const { setScreen, updateNewListing, newListing } = useAppStore()
  const [title, setTitle] = useState(newListing.title || "")
  const [description, setDescription] = useState(newListing.description || "")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    newListing.category || null
  )
  const [isUrgent, setIsUrgent] = useState(newListing.isUrgent || false)
  const [quantity, setQuantity] = useState(
    String(newListing.quantity ?? 1)
  )

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat)
  }

  const handleContinue = () => {
    const q = Math.max(1, Math.floor(parseInt(quantity, 10) || 1))
    updateNewListing({
      title,
      description,
      category: selectedCategory!,
      isUrgent,
      quantity: q,
    })
    setScreen("giver-availability")
  }

  const qtyNum = Math.max(1, Math.floor(parseInt(quantity, 10) || 1))
  const isValid =
    title.trim() && description.trim() && selectedCategory && qtyNum >= 1

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("giver-upload")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <FlowProgressTracker currentStep={2} totalSteps={5} className="mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Item details
          </h2>
          <p className="text-muted-foreground">
            Tell us about what you&apos;re sharing
          </p>
        </div>

        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Ergonomic Office Chair"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the item condition, why you're giving it away..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">How many people can Chope?</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              When this many finders have choped, the listing hides from browse.
              You can archive anytime from My listings.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-xs font-medium">{cat.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary absolute top-1 right-1" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedCategory && (
            <Card className="bg-secondary/50 border-2 border-accent">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Urgent broadcast</h4>
                      <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Notify everyone using the app with a top banner. Use for anything
                      that needs to move quickly—surplus food, last-minute collection,
                      or time-sensitive giveaways.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-auto pt-6">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            disabled={!isValid}
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
