"use client"

import { useMemo, useState } from "react"
import {
  useAppStore,
  type Category,
  type Listing,
  getSlotsUsed,
  getRemaining,
} from "@/lib/store"
import { getPocUser } from "@/lib/poc-users"
import { datetimeLocalFromStored } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  MapPin,
  Plus,
  Package,
  CheckCircle,
  Clock,
  Pencil,
  Archive,
  RotateCcw,
  MessageCircle,
  Users,
} from "lucide-react"

const categoryLabels: Record<Category, string> = {
  food: "Food",
  merch: "Merch",
  electronics: "Electronics",
  "open-jio": "Open Jio",
  other: "Other",
}

export function MyListingsScreen() {
  const {
    setScreen,
    listings,
    chopes,
    sessionUserId,
    updateListing,
    archiveListing,
    reviveListing,
  } = useAppStore()

  const myListings = useMemo(
    () => listings.filter((l) => l.ownerId === sessionUserId),
    [listings, sessionUserId]
  )

  const activeListings = myListings.filter((l) => !l.archived)
  const archivedListings = myListings.filter((l) => l.archived)
  const sessionUser = getPocUser(sessionUserId)

  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [availableFrom, setAvailableFrom] = useState("")
  const [availableUntil, setAvailableUntil] = useState("")
  const [category, setCategory] = useState<Category>("other")
  const [isUrgent, setIsUrgent] = useState(false)

  const [reviveOpen, setReviveOpen] = useState(false)
  const [reviveListingId, setReviveListingId] = useState<string | null>(null)
  const [reviveQuantity, setReviveQuantity] = useState("1")

  const openEdit = (listing: Listing) => {
    const used = getSlotsUsed(listing.id, chopes)
    if (used > 0) return
    setEditingId(listing.id)
    setTitle(listing.title)
    setDescription(listing.description)
    setLocation(listing.location)
    setAvailableFrom(datetimeLocalFromStored(listing.availableFrom, "from"))
    setAvailableUntil(datetimeLocalFromStored(listing.availableUntil, "until"))
    setCategory(listing.category)
    setIsUrgent(listing.isUrgent)
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditingId(null)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    const t = title.trim()
    const d = description.trim()
    const loc = location.trim()
    if (!t || !d || !loc || !availableFrom) return

    const until = availableUntil.trim()
    updateListing(editingId, {
      title: t,
      description: d,
      location: loc,
      availableFrom: availableFrom.trim(),
      availableUntil: until || undefined,
      category,
      isUrgent,
    })
    closeEdit()
  }

  const saveDisabled =
    !title.trim() ||
    !description.trim() ||
    !location.trim() ||
    !availableFrom

  const openRevive = (listing: Listing) => {
    setReviveListingId(listing.id)
    setReviveQuantity(String(Math.max(1, listing.quantity)))
    setReviveOpen(true)
  }


  const handleReviveConfirm = () => {
    if (!reviveListingId) return
    const n = parseInt(reviveQuantity, 10)
    if (Number.isNaN(n) || n < 1) return
    reviveListing(reviveListingId, n)
    setReviveOpen(false)
    setReviveListingId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Available
          </Badge>
        )
      case "reserved":
        return (
          <Badge className="bg-primary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Reserved
          </Badge>
        )
      case "claimed":
        return (
          <Badge variant="outline">
            <Package className="w-3 h-3 mr-1" />
            Claimed
          </Badge>
        )
      default:
        return null
    }
  }

  const getCategoryEmoji = (cat: Category) => {
    switch (cat) {
      case "food":
        return "🍱"
      case "merch":
        return "👕"
      case "electronics":
        return "💻"
      case "open-jio":
        return "👥"
      case "other":
        return "📦"
    }
  }

  const chopesFor = (listingId: string) =>
    chopes.filter((c) => c.listingId === listingId)

  const totalChopesOnActive = activeListings.reduce(
    (acc, l) => acc + getSlotsUsed(l.id, chopes),
    0
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background px-6 py-8 pb-6">
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-6"
        onClick={() => setScreen("welcome")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-foreground">My listings</h2>
          <Button size="sm" onClick={() => setScreen("giver-upload")}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        {sessionUser && (
          <p className="mt-2 text-xs text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {sessionUser.email}
            </span>{" "}
            ({sessionUser.displayName})
          </p>
        )}
      </div>

      {myListings.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start sharing items with your colleagues
            </p>
            <Button onClick={() => setScreen("giver-upload")}>
              <Plus className="w-4 h-4 mr-2" />
              Create listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Active ({activeListings.length})
            </h3>
            {activeListings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active listings. Revive one from Archive below if needed.
              </p>
            ) : (
              <div className="space-y-3">
                {activeListings.map((listing) => {
                  const used = getSlotsUsed(listing.id, chopes)
                  const remaining = getRemaining(listing, chopes)
                  const interests = chopesFor(listing.id)
                  const editLocked = used > 0

                  return (
                    <Card key={listing.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 text-2xl">
                            {getCategoryEmoji(listing.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm leading-tight">
                                {listing.title}
                              </h4>
                              {getStatusBadge(listing.status)}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{listing.location}</span>
                            </p>
                            <p className="text-xs text-foreground mt-2">
                              <span className="font-medium">{used}</span> /{" "}
                              {listing.quantity} choped
                              {listing.quantity > 1 && (
                                <>
                                  {" "}
                                  ·{" "}
                                  <span className="text-muted-foreground">
                                    {remaining} left
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <details className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
                            <Users className="w-4 h-4 shrink-0" />
                            People who choped ({interests.length})
                          </summary>
                          {interests.length === 0 ? (
                            <p className="text-xs text-muted-foreground mt-2 pl-6">
                              No chopes yet.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-2 pl-1">
                              {interests.map((c) => (
                                <li
                                  key={c.id}
                                  className="text-xs border-b border-border/60 pb-2 last:border-0 last:pb-0"
                                >
                                  <p className="font-medium text-foreground">
                                    {c.requesterName}
                                    <span className="font-normal text-muted-foreground">
                                      {" "}
                                      · {c.requesterDepartment}
                                    </span>
                                  </p>
                                  <p className="text-muted-foreground">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </p>
                                  {c.message && (
                                    <p className="mt-1 flex gap-1.5 text-muted-foreground">
                                      <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      <span>{c.message}</span>
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </details>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[7rem]"
                            disabled={editLocked}
                            onClick={() => openEdit(listing)}
                            title={
                              editLocked
                                ? "Cannot edit while there are chopes. Archive or wait until you revive with a fresh quantity."
                                : undefined
                            }
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="flex-1 min-w-[7rem]"
                            onClick={() => archiveListing(listing.id)}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            Archive
                          </Button>
                        </div>
                        {editLocked && (
                          <p className="text-xs text-muted-foreground">
                            Editing is disabled while someone has choped. Archive
                            when you&apos;re done offline; use Revive to list
                            again with a new quantity (clears in-app chopes).
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <details className="rounded-xl border border-border bg-card mb-6">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold list-none [&::-webkit-details-marker]:hidden flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archived ({archivedListings.length})
              </span>
            </summary>
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {archivedListings.length === 0 ? (
                <p className="text-xs text-muted-foreground">No archived listings.</p>
              ) : (
                archivedListings.map((listing) => {
                  const used = getSlotsUsed(listing.id, chopes)
                  const interests = chopesFor(listing.id)
                  return (
                    <Card key={listing.id} className="bg-muted/20">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-medium text-sm">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {used} chope{used === 1 ? "" : "s"} on record
                        </p>
                        {interests.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                            {interests.map((c) => (
                              <li key={c.id}>
                                {c.requesterName}
                                {c.message ? ` — “${c.message.slice(0, 40)}${c.message.length > 40 ? "…" : ""}”` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => openRevive(listing)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Revive listing
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </details>
        </>
      )}

      <div className="mt-auto p-4 bg-secondary/50 rounded-xl">
        <h3 className="font-semibold text-sm mb-2">Your impact</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{activeListings.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{totalChopesOnActive}</p>
            <p className="text-xs text-muted-foreground">Chope</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{archivedListings.length}</p>
            <p className="text-xs text-muted-foreground">Archived</p>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-h-[min(90dvh,640px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
            <DialogDescription>
              Update how this listing appears to finders. Photos are unchanged
              for now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details for collectors"
                className="min-h-[100px] resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Pickup location</Label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Level 5, Pantry"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-from">Available from</Label>
                <Input
                  id="edit-from"
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-until">Available until (optional)</Label>
                <Input
                  id="edit-until"
                  type="datetime-local"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(categoryLabels) as Category[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabels[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Urgent</p>
                <p className="text-xs text-muted-foreground">
                  Show urgent styling and banner when on
                </p>
              </div>
              <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={saveDisabled}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reviveOpen}
        onOpenChange={(open) => {
          setReviveOpen(open)
          if (!open) setReviveListingId(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revive listing</DialogTitle>
            <DialogDescription>
              Set how many quantity are available now. This clears in-app chopes for
              this listing so finders can chope again up to that number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="revive-qty">Available quantity</Label>
            <Input
              id="revive-qty"
              type="number"
              min={1}
              step={1}
              value={reviveQuantity}
              onChange={(e) => setReviveQuantity(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReviveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReviveConfirm}
              disabled={
                !reviveQuantity.trim() ||
                Number.isNaN(parseInt(reviveQuantity, 10)) ||
                parseInt(reviveQuantity, 10) < 1
              }
            >
              Revive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
