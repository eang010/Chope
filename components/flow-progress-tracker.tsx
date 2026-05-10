"use client"

import { Fragment } from "react"
import { cn } from "@/lib/utils"

export interface FlowProgressTrackerProps {
  /** 1-based index of the active step */
  currentStep: number
  totalSteps: number
  className?: string
}

/**
 * Discrete horizontal stepper: no text — connectors use strict “completed
 * path” (`stepNum - 1 < active`) so step 1 shows the first dot only, then
 * lines fill after each completed step. Current dot has a soft halo; upcoming
 * dots are hollow outlines.
 */
export function FlowProgressTracker({
  currentStep,
  totalSteps,
  className,
}: FlowProgressTrackerProps) {
  const n = Math.max(1, totalSteps)
  const active = Math.min(Math.max(1, currentStep), n)

  return (
    <div
      className={cn("w-full", className)}
      role="group"
      aria-label={`Step ${active} of ${n}`}
    >
      <div className="flex w-full items-center" aria-hidden>
        {Array.from({ length: n }, (_, i) => {
          const stepNum = i + 1
          const done = stepNum < active
          const current = stepNum === active
          const upcoming = stepNum > active

          return (
            <Fragment key={stepNum}>
              {i > 0 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 min-w-2 flex-1 rounded-full transition-colors sm:mx-1.5",
                    stepNum - 1 < active ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
              <div
                className={cn(
                  "size-3 shrink-0 rounded-full border-2 transition-[color,box-shadow,background-color] sm:size-3.5",
                  done && "border-primary bg-primary",
                  current &&
                    "border-primary bg-primary ring-4 ring-primary/25 ring-offset-2 ring-offset-background",
                  upcoming &&
                    "border-muted-foreground/55 bg-transparent shadow-none"
                )}
              />
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
