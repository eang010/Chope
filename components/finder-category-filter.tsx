"use client"

import type { ReactNode } from "react"
import { useAppStore, type Category } from "@/lib/store"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Check,
  Laptop,
  Package,
  Shirt,
  Users,
  Utensils,
} from "lucide-react"

const categories: {
  id: Category
  label: string
  icon: ReactNode
  description: string
}[] = [
  {
    id: "food",
    label: "Food & Snacks",
    icon: <Utensils className="h-6 w-6" />,
    description: "Surplus meals, snacks & pantry items",
  },
  {
    id: "merch",
    label: "Company Merch",
    icon: <Shirt className="h-6 w-6" />,
    description: "T-shirts, plushies & corporate swag",
  },
  {
    id: "open-jio",
    label: "Open Jio",
    icon: <Users className="h-6 w-6" />,
    description: "Group food orders & lunch buddies",
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: <Laptop className="h-6 w-6" />,
    description: "Gadgets, peripherals & accessories",
  },
  {
    id: "other",
    label: "Other Items",
    icon: <Package className="h-6 w-6" />,
    description: "Everything else",
  },
]

export interface FinderCategoryFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinderCategoryFilterSheet({
  open,
  onOpenChange,
}: FinderCategoryFilterSheetProps) {
  const selectedCategories = useAppStore((s) => s.selectedCategories)
  const toggleCategory = useAppStore((s) => s.toggleCategory)

  const clearFilters = () => {
    useAppStore.setState({ selectedCategories: [] })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[85dvh] min-h-0 flex-col gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b border-border px-4 pb-4 pt-2 text-left">
          <SheetTitle>Filter by category</SheetTitle>
          <SheetDescription>
            Leave none selected to show every category. Pick one or more to
            narrow the feed.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <Card
                  key={cat.id}
                  className={cn(
                    "cursor-pointer border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border"
                  )}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cat.icon}
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                      {cat.label}
                    </h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {cat.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border bg-background px-4 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={clearFilters}
          >
            Show all
          </Button>
          <Button type="button" className="flex-1" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
