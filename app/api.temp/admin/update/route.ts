import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const updateConfig = {
  users: {
    table: "user_profiles",
    fields: ["user_role", "status"],
  },
  consultations: {
    table: "consultations",
    fields: ["status", "consultant_notes", "follow_up_needed", "follow_up_date"],
  },
  applications: {
    table: "applications",
    fields: ["status", "priority", "consultant_notes", "assigned_consultant"],
  },
  countries: {
    table: "countries",
    fields: ["is_active", "sort_order"],
  },
  programs: {
    table: "visa_programs",
    fields: ["is_active", "is_featured", "sort_order"],
  },
  notifications: {
    table: "notifications",
    fields: ["is_read"],
  },
} as const

type ResourceName = keyof typeof updateConfig

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const body = await request.json().catch(() => ({}))
  const resource = body?.resource as ResourceName
  const id = typeof body?.id === "string" ? body.id : ""
  const updates = body?.updates && typeof body.updates === "object" ? body.updates : null
  const config = updateConfig[resource]

  if (!config || !id || !updates) {
    return NextResponse.json({ error: "Invalid admin update request" }, { status: 400 })
  }

  const allowedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => (config.fields as readonly string[]).includes(key))
  )

  if (Object.keys(allowedUpdates).length === 0) {
    return NextResponse.json({ error: "No allowed fields to update" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(config.table)
    .update(allowedUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data })
}
