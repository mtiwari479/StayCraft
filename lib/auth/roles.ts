export const APP_ROLES = ["admin", "owner", "tenant"] as const

export type AppRole = (typeof APP_ROLES)[number]

const ROLE_HOME_PATHS: Record<AppRole, "/admin" | "/owner" | "/tenant"> = {
  admin: "/admin",
  owner: "/owner",
  tenant: "/tenant",
}

export function isAppRole(value: unknown): value is AppRole {
  if (typeof value !== "string") {
    return false
  }

  return APP_ROLES.includes(value as AppRole)
}

export function getRoleHomePath(role: AppRole) {
  return ROLE_HOME_PATHS[role]
}