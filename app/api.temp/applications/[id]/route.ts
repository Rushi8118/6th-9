import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .rpc("get_application_management_data", { p_application_id: params.id })
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load application details" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json().catch(() => ({}))
    const { action, reason, value } = body || {}

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .rpc("manage_application", {
        p_application_id: params.id,
        p_action: action,
        p_value: value || {},
        p_reason: reason || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to manage application" },
      { status: 500 }
    )
  }
}
