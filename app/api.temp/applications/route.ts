import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const emptyList: unknown[] = []

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const supabase = createAdminClient()

    const [applications, users, countries, programs] = await Promise.all([
      supabase
        .from("applications")
        .select("id,application_id,user_id,application_type,status,priority,country_id,visa_program_id,consultant_notes,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("user_profiles")
        .select("id,email,full_name")
        .order("created_at", { ascending: false }),
      supabase
        .from("countries")
        .select("id,code,name,flag_emoji"),
      supabase
        .from("visa_programs")
        .select("id,country_id,program_type,name,slug"),
    ])

    const usersById = new Map(
      (users.data || []).map((user) => [
        user.id,
        { id: user.id, full_name: user.full_name, email: user.email },
      ])
    )

    const countriesById = new Map(
      (countries.data || []).map((country) => [
        country.id,
        { id: country.id, name: country.name, code: country.code, flag_emoji: country.flag_emoji },
      ])
    )

    const programsById = new Map(
      (programs.data || []).map((program) => [
        program.id,
        { id: program.id, name: program.name, program_type: program.program_type },
      ])
    )

    const enrichedApplications = (applications.data || []).map((item) => ({
      ...item,
      user: item.user_id ? usersById.get(item.user_id) || null : null,
      country: item.country_id ? countriesById.get(item.country_id) || null : null,
      program: item.visa_program_id ? programsById.get(item.visa_program_id) || null : null,
    }))

    return NextResponse.json({ applications: enrichedApplications })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load applications" },
      { status: 500 }
    )
  }
}
