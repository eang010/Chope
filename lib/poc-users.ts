/** POC-only personas for dual-account testing (no real auth). */

export interface PocUser {
  id: string
  email: string
  displayName: string
  department: string
}

export const POC_USERS: readonly PocUser[] = [
  {
    id: "tester-a",
    email: "chopechope@example.com",
    displayName: "Chope Squad",
    department: "IT Division",
  },
  {
    id: "tester-b",
    email: "bob@example.com",
    displayName: "Bob Lee",
    department: "Engineering",
  },
] as const

export const DEFAULT_POC_USER_ID = POC_USERS[0].id

export function getPocUser(id: string): PocUser | undefined {
  return POC_USERS.find((u) => u.id === id)
}

export function isPocUserId(id: string): boolean {
  return POC_USERS.some((u) => u.id === id)
}
