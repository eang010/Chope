"use client"

import { useState, useRef } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlowProgressTracker } from "@/components/flow-progress-tracker"

export function GiverUploadScreen() {
  const { setScreen, updateNewListing, newListing } = useAppStore()
  const [images, setImages] = useState<string[]>(newListing.images || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    const newImages = Array.from(files).map(
      (_, i) =>
        `/placeholder.svg?height=400&width=400&text=Image${images.length + i + 1}`
    )
    setImages((prev) => [...prev, ...newImages].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    updateNewListing({ images })
    setScreen("giver-details")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:py-8 bg-background">
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
          <FlowProgressTracker currentStep={1} totalSteps={5} className="mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Add photos
          </h2>
          <p className="text-muted-foreground">
            Upload up to 5 photos of your item or food
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {images.map((img, index) => (
            <Card key={`${img}-${index}`} className="relative aspect-square overflow-hidden">
              <img
                src={img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                onClick={() => removeImage(index)}
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-xs py-1 text-center">
                  Cover
                </div>
              )}
            </Card>
          ))}

          {images.length < 5 && (
            <Card
              className={cn(
                "aspect-square cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors",
                "flex items-center justify-center"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="p-0 flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </CardContent>
            </Card>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <Card className="bg-secondary/50 border-0">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Photo tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Show the item from multiple angles</li>
              <li>• Use good lighting for clear photos</li>
              <li>• Include any wear or damage if applicable</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-auto pt-6">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-base"
            disabled={images.length === 0}
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={() => {
              setImages(["/placeholder.svg?height=400&width=400"])
              updateNewListing({ images: ["/placeholder.svg?height=400&width=400"] })
              setScreen("giver-details")
            }}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}
