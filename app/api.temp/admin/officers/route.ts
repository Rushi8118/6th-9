import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("get_application_officers")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ officers: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load officers" },
      { status: 500 }
    )
  }
}
