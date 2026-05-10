"use client"

import { useState } from "react"
import { ChevronDown, User } from "lucide-react"
import { POC_USERS, getPocUser } from "@/lib/poc-users"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type PocAccountSwitcherVariant = "welcome" | "dock"

export interface PocAccountSwitcherProps {
  /** `welcome`: in page flow (e.g. under Get Started). `dock`: fixed top-right (`z-40` so urgent banner at `z-50` stays tappable). */
  variant?: PocAccountSwitcherVariant
}

const dockAnchorClass =
  "pointer-events-auto fixed right-3 top-[calc(env(safe-area-inset-top,0px)+0.5rem)] z-40 sm:right-4"

const dockStackClass = cn(dockAnchorClass, "flex flex-col items-end gap-2")

const dockPanelClass =
  "w-full max-w-[min(calc(100vw-1.5rem),18rem)] rounded-lg border border-border bg-card/95 p-2 text-xs shadow-md backdrop-blur-md"

const dockCircleButtonClass =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card/95 text-primary shadow-md backdrop-blur-md transition-colors hover:bg-muted/80"

/** POC-only: switch between two tester personas (no real auth). */
export function PocAccountSwitcher({ variant = "dock" }: PocAccountSwitcherProps) {
  const sessionUserId = useAppStore((s) => s.sessionUserId)
  const setSessionUserId = useAppStore((s) => s.setSessionUserId)
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  /** Dock: false = people icon only; true = icon + account list below. */
  const [dockPanelOpen, setDockPanelOpen] = useState(false)

  const sessionUser = getPocUser(sessionUserId)

  const handlePickAccount = (id: string) => {
    setSessionUserId(id)
    setDockPanelOpen(false)
    setWelcomeOpen(false)
  }

  const accountButtons = (
    <div className="flex flex-col gap-1">
      {POC_USERS.map((u) => (
        <button
          key={u.id}
          type="button"
          className={cn(
            "rounded-md px-2 py-1.5 text-left text-xs transition-colors",
            sessionUserId === u.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 hover:bg-muted"
          )}
          onClick={() => handlePickAccount(u.id)}
        >
          <span className="block truncate font-medium">{u.displayName}</span>
          <span
            className={cn(
              "block truncate opacity-90",
              sessionUserId === u.id
                ? "text-primary-foreground/90"
                : "text-muted-foreground"
            )}
          >
            {u.email}
          </span>
        </button>
      ))}
    </div>
  )

  if (variant === "welcome") {
    return (
      <Collapsible
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        className="w-full rounded-lg border border-border bg-card p-2 text-left shadow-sm"
      >
        <CollapsibleTrigger
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
          aria-expanded={welcomeOpen}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              POC test account
            </span>
            <span className="block truncate text-sm font-medium text-foreground">
              {sessionUser?.displayName ?? "Select account"}
            </span>
            {sessionUser && (
              <span className="block truncate text-[0.7rem] text-muted-foreground">
                {sessionUser.email}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              welcomeOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>{accountButtons}</CollapsibleContent>
      </Collapsible>
    )
  }

  if (!dockPanelOpen) {
    return (
      <button
        type="button"
        className={cn(dockAnchorClass, dockCircleButtonClass)}
        onClick={() => setDockPanelOpen(true)}
        aria-label="Open POC account switcher"
        aria-expanded="false"
      >
        <User className="size-[18px]" strokeWidth={2} />
      </button>
    )
  }

  return (
    <div className={dockStackClass}>
      <button
        type="button"
        className={dockCircleButtonClass}
        aria-label="Close POC account switcher"
        title="Close POC account switcher"
        aria-expanded="true"
        onClick={() => setDockPanelOpen(false)}
      >
        <User className="size-[18px]" strokeWidth={2} />
      </button>

      <div className={dockPanelClass}>
        <p className="mb-2 px-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          POC test account
        </p>
        {accountButtons}
      </div>
    </div>
  )
}
