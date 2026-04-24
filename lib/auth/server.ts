import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getRoleHomePath, isAppRole, type AppRole } from "@/lib/auth/roles"

export type UserProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: AppRole
  is_active: boolean
}

type ProfileQueryRow = {
  id: string
  full_name: string | null
  email: string | null
  role: string
  is_active: boolean
}

function buildAuthErrorPath(message: string) {
  return `/auth/error?error=${encodeURIComponent(message)}`
}

function isSafeInternalPath(path: string | null | undefined) {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"))
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    return {
      user: null,
      profile: null,
      supabase,
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,role,is_active")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    if (error.code === "PGRST205") {
      redirect(
        buildAuthErrorPath(
          "Profiles table is missing. Run the latest Supabase schema SQL first."
        )
      )
    }

    throw error
  }

  const profileRow = data as ProfileQueryRow | null

  if (!profileRow) {
    return {
      user,
      profile: null,
      supabase,
    }
  }

  if (!isAppRole(profileRow.role)) {
    redirect(buildAuthErrorPath("Invalid account role on your profile."))
  }

  return {
    user,
    profile: {
      id: profileRow.id,
      full_name: profileRow.full_name,
      email: profileRow.email,
      role: profileRow.role,
      is_active: profileRow.is_active,
    } as UserProfile,
    supabase,
  }
}

export async function requireRole(allowedRoles: AppRole[]) {
  const context = await getCurrentUserProfile()

  if (!context.user) {
    redirect("/auth/login")
  }

  if (!context.profile) {
    redirect(
      buildAuthErrorPath("Your profile is not set up yet. Please contact support.")
    )
  }

  if (!context.profile.is_active) {
    redirect(
      buildAuthErrorPath(
        "Your account is inactive right now. Please contact support."
      )
    )
  }

  if (!allowedRoles.includes(context.profile.role)) {
    redirect(getRoleHomePath(context.profile.role))
  }

  return {
    user: context.user,
    profile: context.profile,
    supabase: context.supabase,
  }
}

export async function getPostLoginRedirectPath(preferredPath?: string | null) {
  if (isSafeInternalPath(preferredPath)) {
    return preferredPath as string
  }

  const context = await getCurrentUserProfile()

  if (!context.user) {
    return "/auth/login"
  }

  if (!context.profile) {
    return buildAuthErrorPath(
      "Your profile is not set up yet. Run the latest schema migration."
    )
  }

  if (!context.profile.is_active) {
    return buildAuthErrorPath("Your account is inactive.")
  }

  return getRoleHomePath(context.profile.role)
}