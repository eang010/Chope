import { create } from "zustand"
import { DEFAULT_POC_USER_ID, getPocUser } from "@/lib/poc-users"

export type Category = "food" | "merch" | "electronics" | "open-jio" | "other"

/** One terminal Chope (no accept/reject in app). */
export interface ChopeRecord {
  id: string
  listingId: string
  requesterId: string
  requesterName: string
  requesterDepartment: string
  message?: string
  createdAt: string
}

export interface Listing {
  id: string
  title: string
  description: string
  category: Category
  images: string[]
  location: string
  availableFrom: string
  availableUntil?: string
  ownerId: string
  ownerName: string
  ownerDepartment: string
  isUrgent: boolean
  createdAt: string
  status: "available" | "reserved" | "claimed"
  reservedBy?: string
  /** How many finders can Chope before the listing is full. */
  quantity: number
  /** Hidden from finder browse; shown under Archived for the giver. */
  archived: boolean
}

export function getSlotsUsed(listingId: string, chopes: ChopeRecord[]): number {
  return chopes.filter((c) => c.listingId === listingId).length
}

export function getRemaining(listing: Listing, chopes: ChopeRecord[]): number {
  return Math.max(0, listing.quantity - getSlotsUsed(listing.id, chopes))
}

export function listingShowsInFinderBrowse(
  listing: Listing,
  chopes: ChopeRecord[],
  selectedCategories: Category[]
): boolean {
  const categoryOk =
    selectedCategories.length === 0 ||
    selectedCategories.includes(listing.category)
  return (
    categoryOk &&
    listing.status === "available" &&
    !listing.archived &&
    getRemaining(listing, chopes) > 0
  )
}

/** All listings that qualify for the urgent banner (stable array order). */
export function listUrgentBannerCandidates(
  listings: Listing[],
  chopes: ChopeRecord[]
): Listing[] {
  return listings.filter(
    (l) => l.isUrgent && !l.archived && getRemaining(l, chopes) > 0
  )
}

type Screen =
  | "welcome"
  | "role-select"
  | "finder-browse"
  | "giver-upload"
  | "giver-details"
  | "giver-availability"
  | "giver-location"
  | "giver-preview"
  | "giver-success"
  | "my-listings"
  | "my-reservations"
  | "listing-requests"

interface AppState {
  screen: Screen
  role: "giver" | "finder" | null
  /** POC: which tester persona is acting as "me". */
  sessionUserId: string
  selectedCategories: Category[]
  currentListingIndex: number
  newListing: Partial<Listing>
  listings: Listing[]
  chopes: ChopeRecord[]
  /** Featured urgent listing id; null when dismissed or no eligible urgents. */
  urgentFeaturedId: string | null
  setScreen: (screen: Screen) => void
  setRole: (role: "giver" | "finder") => void
  setSessionUserId: (id: string) => void
  toggleCategory: (category: Category) => void
  setCurrentListingIndex: (index: number) => void
  updateNewListing: (data: Partial<Listing>) => void
  resetNewListing: () => void
  addListing: (listing: Listing) => void
  updateListing: (id: string, data: Partial<Listing>) => void
  updateListingStatus: (id: string, status: Listing["status"], reservedBy?: string) => void
  /** Returns false if this finder already choped this listing. */
  addChope: (input: { listingId: string; message?: string }) => boolean
  /** Finder removes their chope; frees a slot for the listing (same as never choped). */
  releaseChope: (chopeId: string) => void
  archiveListing: (id: string) => void
  /** Permanently remove listing and all chopes for it (any chope count). */
  deleteListing: (id: string) => void
  reviveListing: (id: string, newQuantity: number) => void
  dismissUrgentBanner: () => void
  goNextUrgentBanner: () => void
  goPrevUrgentBanner: () => void
  /** Jump to the urgent candidate at this index (see `listUrgentBannerCandidates` order). */
  setUrgentFeaturedBannerIndex: (index: number) => void
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "{build} Hackathon Giveaway - from Chope Squad",
    description:
      "Show your support for the Chope Squad by 'chope-ing' your giveaway! Chope now and find us at our booth to claim your gift!",
    category: "merch",
    images: [
      "https://down-sg.img.susercontent.com/file/sg-11134103-8260k-mkj8a2cefabo7e.webp",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvdfzrANLiKhCF-xX0YeAdBDjQe0fOIjwcFQ&s",
    ],
    location: "PDD Booth",
    availableFrom: "2026-05-25T14:00",
    availableUntil: "2026-05-25T17:00",
    ownerId: "tester-a",
    ownerName: "Chope Squad",
    ownerDepartment: "IT Division",
    isUrgent: true,
    createdAt: "2025-05-25",
    status: "available",
    quantity: 30,
    archived: false,
  },
  {
    id: "2",
    title: "Company Anniversary T-Shirt",
    description:
      "Limited edition company 10th anniversary t-shirt. Size M. Never worn, still has tags. Nice soft cotton material.",
    category: "merch",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop",
    ],
    location: "Level 5, Right Wing",
    availableFrom: "2024-01-16",
    ownerId: "user2",
    ownerName: "John Lim",
    ownerDepartment: "IT Department",
    isUrgent: false,
    createdAt: "2024-01-11",
    status: "available",
    quantity: 2,
    archived: false,
  },
  {
    id: "3",
    title: " IT Division Brownbag Lunch Buffet",
    description:
      "Sandwiches, pastries, and drinks from today's brownbag lunch. Please collect by 4pm!",
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
    ],
    location: "Level 3, Pantry Area",
    availableFrom: "2024-01-15T15:00",
    availableUntil: "2024-01-15T16:30",
    ownerId: "tester-a",
    ownerName: "Chope Squad",
    ownerDepartment: "IT Division",
    isUrgent: true,
    createdAt: "2024-01-15",
    status: "available",
    quantity: 8,
    archived: false,
  },
  {
    id: "4",
    title: "GrabFood Lunch Order - Thai Food",
    description:
      "Ordering from Nakhon Kitchen for lunch! Min order $30 for free delivery. Drop your orders by 11am. Collecting at Level 1 lift lobby.",
    category: "open-jio",
    images: [
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=400&fit=crop",
    ],
    location: "Level 5, Lobby",
    availableFrom: "2024-01-17",
    availableUntil: "2024-01-17T11:00",
    ownerId: "tester-a",
    ownerName: "Chope Squad",
    ownerDepartment: "IT Division",
    isUrgent: false,
    createdAt: "2024-01-17",
    status: "available",
    quantity: 5,
    archived: false,
  },
  {
    id: "5",
    title: "GrabFood Dinner Order - Japanese",
    description:
      "Ordering from Genki Sushi for dinner around 6pm! Anyone interested to join? Will be collecting at main entrance.",
    category: "open-jio",
    images: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=400&fit=crop",
    ],
    location: "Main Entrance",
    availableFrom: "2024-01-17",
    availableUntil: "2024-01-17T17:30",
    ownerId: "user7",
    ownerName: "Kevin Teo",
    ownerDepartment: "Marketing",
    isUrgent: false,
    createdAt: "2024-01-17",
    status: "available",
    quantity: 4,
    archived: false,
  },
  {
    id: "6",
    title: "Pantry Snacks - Biscuits & Chips",
    description:
      "Leftover snacks from team celebration. Assorted biscuits, chips, and crackers. Help yourself!",
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
    ],
    location: "Level 7, Pantry",
    availableFrom: "2024-01-16",
    ownerId: "user8",
    ownerName: "Rachel Goh",
    ownerDepartment: "Design Team",
    isUrgent: false,
    createdAt: "2024-01-16",
    status: "available",
    quantity: 6,
    archived: false,
  },
  {
    id: "7",
    title: "Mooncakes - Assorted Flavours",
    description:
      "Extra mooncakes from Mid-Autumn Festival. Mix of snowskin and traditional baked. Best before end of week!",
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1726568948497-ee41ebfbb2ef?q=80&w=2370&fit=crop",
      "https://plus.unsplash.com/premium_photo-1664474816376-408f8ba74be2?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1669399304603-d6b5636fda95?w=400&h=400&fit=crop",
    ],
    location: "Level 4, Meeting Room 3",
    availableFrom: "2024-01-15",
    availableUntil: "2024-01-19",
    ownerId: "user9",
    ownerName: "Amy Lim",
    ownerDepartment: "Corporate Comms",
    isUrgent: false,
    createdAt: "2024-01-15",
    status: "available",
    quantity: 3,
    archived: false,
  },
  {
    id: "8",
    title: "Instant Noodles & Cup Noodles",
    description:
      "Bought too many! Assorted flavours - curry, tom yum, seafood. About 10 packets available.",
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop",
    ],
    location: "Level 2, Pantry",
    availableFrom: "2024-01-14",
    ownerId: "tester-a",
    ownerName: "Chope Squad",
    ownerDepartment: "IT Division",
    isUrgent: false,
    createdAt: "2024-01-14",
    status: "available",
    quantity: 10,
    archived: false,
  },
  {
    id: "9",
    title: "Wireless Keyboard & Mouse Set",
    description:
      "Logitech wireless combo. Batteries included. Minor wear but fully functional.",
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    ],
    location: "Level 10, Left Wing",
    availableFrom: "2024-01-17",
    ownerId: "tester-b",
    ownerName: "Bob Lee",
    ownerDepartment: "Engineering",
    isUrgent: false,
    createdAt: "2024-01-12",
    status: "available",
    quantity: 2,
    archived: false,
  },
]

export const useAppStore = create<AppState>((set, get) => ({
  screen: "welcome",
  role: null,
  sessionUserId: DEFAULT_POC_USER_ID,
  selectedCategories: [],
  currentListingIndex: 0,
  newListing: {},
  listings: mockListings,
  chopes: [],
  urgentFeaturedId:
    listUrgentBannerCandidates(mockListings, [])[0]?.id ?? null,
  setScreen: (screen) => set({ screen }),
  setRole: (role) => set({ role }),
  setSessionUserId: (id) => {
    if (!getPocUser(id)) return
    set({ sessionUserId: id })
  },
  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),
  setCurrentListingIndex: (index) => set({ currentListingIndex: index }),
  updateNewListing: (data) =>
    set((state) => ({ newListing: { ...state.newListing, ...data } })),
  resetNewListing: () => set({ newListing: {} }),
  addListing: (listing) =>
    set((state) => {
      const listings = [listing, ...state.listings]
      const chopes = state.chopes
      let urgentFeaturedId = state.urgentFeaturedId
      if (
        listing.isUrgent &&
        !listing.archived &&
        getRemaining(listing, chopes) > 0
      ) {
        urgentFeaturedId = listing.id
      } else if (urgentFeaturedId != null) {
        const c = listUrgentBannerCandidates(listings, chopes)
        const idx = c.findIndex((l) => l.id === urgentFeaturedId)
        if (idx < 0) {
          urgentFeaturedId = c[0]?.id ?? null
        }
      }
      return { listings, urgentFeaturedId }
    }),
  updateListing: (id, data) =>
    set((state) => {
      const listings = state.listings.map((l) =>
        l.id === id ? { ...l, ...data } : l
      )
      const chopes = state.chopes
      const c = listUrgentBannerCandidates(listings, chopes)
      let urgentFeaturedId = state.urgentFeaturedId
      if (urgentFeaturedId !== null) {
        const stillFeatured = c.some((l) => l.id === urgentFeaturedId)
        if (!stillFeatured) {
          urgentFeaturedId = c[0]?.id ?? null
        }
      }
      return { listings, urgentFeaturedId }
    }),
  updateListingStatus: (id, status, reservedBy) =>
    set((state) => ({
      listings: state.listings.map((l) =>
        l.id === id ? { ...l, status, reservedBy } : l
      ),
    })),
  addChope: (input) => {
    const { chopes, listings, sessionUserId } = get()
    const user = getPocUser(sessionUserId)
    if (!user) return false
    if (
      chopes.some(
        (c) =>
          c.listingId === input.listingId && c.requesterId === sessionUserId
      )
    ) {
      return false
    }
    const record: ChopeRecord = {
      listingId: input.listingId,
      requesterId: user.id,
      requesterName: user.displayName,
      requesterDepartment: user.department,
      message: input.message,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    const nextChopes = [...chopes, record]
    const listing = listings.find((l) => l.id === record.listingId)
    let urgentFeaturedId = get().urgentFeaturedId
    if (
      listing &&
      urgentFeaturedId === listing.id &&
      getRemaining(listing, nextChopes) === 0
    ) {
      const c = listUrgentBannerCandidates(listings, nextChopes)
      urgentFeaturedId = c[0]?.id ?? null
    }
    set({ chopes: nextChopes, urgentFeaturedId })
    return true
  },
  releaseChope: (chopeId) =>
    set((state) => {
      const target = state.chopes.find((c) => c.id === chopeId)
      if (!target || target.requesterId !== state.sessionUserId) {
        return state
      }
      const nextChopes = state.chopes.filter((c) => c.id !== chopeId)
      const c = listUrgentBannerCandidates(state.listings, nextChopes)
      const urgentFeaturedId = c[0]?.id ?? null
      return { chopes: nextChopes, urgentFeaturedId }
    }),
  archiveListing: (id) =>
    set((state) => {
      const listings = state.listings.map((l) =>
        l.id === id ? { ...l, archived: true } : l
      )
      let urgentFeaturedId = state.urgentFeaturedId
      if (urgentFeaturedId === id) {
        const c = listUrgentBannerCandidates(listings, state.chopes)
        urgentFeaturedId = c[0]?.id ?? null
      }
      return { listings, urgentFeaturedId }
    }),
  deleteListing: (id) =>
    set((state) => {
      const listings = state.listings.filter((l) => l.id !== id)
      const chopes = state.chopes.filter((c) => c.listingId !== id)
      let urgentFeaturedId = state.urgentFeaturedId
      if (urgentFeaturedId === id) {
        const c = listUrgentBannerCandidates(listings, chopes)
        urgentFeaturedId = c[0]?.id ?? null
      }
      return { listings, chopes, urgentFeaturedId }
    }),
  reviveListing: (id, newQuantity) => {
    const q = Math.max(1, Math.floor(newQuantity))
    set((state) => {
      const listings = state.listings.map((l) =>
        l.id === id ? { ...l, archived: false, quantity: q } : l
      )
      const chopes = state.chopes.filter((c) => c.listingId !== id)
      const revived = listings.find((l) => l.id === id)
      let urgentFeaturedId = state.urgentFeaturedId
      if (
        revived?.isUrgent &&
        !revived.archived &&
        getRemaining(revived, chopes) > 0
      ) {
        urgentFeaturedId = revived.id
      } else if (state.urgentFeaturedId === id) {
        const c = listUrgentBannerCandidates(listings, chopes)
        urgentFeaturedId = c[0]?.id ?? null
      }
      return { listings, chopes, urgentFeaturedId }
    })
  },
  dismissUrgentBanner: () => set({ urgentFeaturedId: null }),
  goNextUrgentBanner: () =>
    set((state) => {
      const c = listUrgentBannerCandidates(state.listings, state.chopes)
      if (state.urgentFeaturedId == null || c.length <= 1) return state
      const i = c.findIndex((l) => l.id === state.urgentFeaturedId)
      if (i < 0) return state
      const ni = (i + 1) % c.length
      return { urgentFeaturedId: c[ni].id }
    }),
  goPrevUrgentBanner: () =>
    set((state) => {
      const c = listUrgentBannerCandidates(state.listings, state.chopes)
      if (state.urgentFeaturedId == null || c.length <= 1) return state
      const i = c.findIndex((l) => l.id === state.urgentFeaturedId)
      if (i < 0) return state
      const ni = (i - 1 + c.length) % c.length
      return { urgentFeaturedId: c[ni].id }
    }),
  setUrgentFeaturedBannerIndex: (index) =>
    set((state) => {
      if (state.urgentFeaturedId == null) return state
      const c = listUrgentBannerCandidates(state.listings, state.chopes)
      if (c.length <= 1 || index < 0 || index >= c.length) return state
      return { urgentFeaturedId: c[index].id }
    }),
}))
