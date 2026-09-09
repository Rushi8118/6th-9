import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const emptyList: unknown[] = []

async function countRows(supabase: ReturnType<typeof createAdminClient>, table: string) {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true })
  return count || 0
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const supabase = createAdminClient()

    const [
      userCount,
      consultationCount,
      applicationCount,
      countryCount,
      programCount,
      notificationCount,
      users,
      consultations,
      applications,
      countries,
      programs,
      notifications,
    ] = await Promise.all([
      countRows(supabase, "user_profiles"),
      countRows(supabase, "consultations"),
      countRows(supabase, "applications"),
      countRows(supabase, "countries"),
      countRows(supabase, "visa_programs"),
      countRows(supabase, "notifications"),
      supabase
        .from("user_profiles")
        .select("id,email,full_name,phone,whatsapp,user_role,status,created_at,last_login_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("consultations")
        .select("id,user_id,consultation_type,status,scheduled_at,phone_number,whatsapp_number,preferred_country,visa_category,user_notes,consultant_notes,follow_up_needed,follow_up_date,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("applications")
        .select("id,application_id,user_id,application_type,status,priority,country_id,visa_program_id,personal_info,education_history,work_history,document_checklist,consultant_notes,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("countries")
        .select("id,code,name,slug,region,flag_emoji,is_active,sort_order,created_at,updated_at")
        .order("sort_order", { ascending: true })
        .limit(100),
      supabase
        .from("visa_programs")
        .select("id,country_id,program_type,name,slug,is_active,is_featured,sort_order,created_at,updated_at")
        .order("sort_order", { ascending: true })
        .limit(200),
      supabase
        .from("notifications")
        .select("id,user_id,type,title,message,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ])

    const usersById = new Map(
      (users.data || []).map((user) => [
        user.id,
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          whatsapp: user.whatsapp,
        },
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

    const enrichedConsultations = (consultations.data || []).map((item) => ({
      ...item,
      user: item.user_id ? usersById.get(item.user_id) || null : null,
    }))

    const enrichedApplications = (applications.data || []).map((item) => ({
      ...item,
      user: usersById.get(item.user_id) || null,
      country: countriesById.get(item.country_id) || null,
      program: programsById.get(item.visa_program_id) || null,
    }))

    const activeConsultations = (consultations.data || []).filter((item) =>
      ["requested", "scheduled", "confirmed"].includes(item.status)
    ).length

    const activeApplications = (applications.data || []).filter(
      (item) => !["approved", "rejected", "withdrawn"].includes(item.status)
    ).length

    return NextResponse.json({
      metrics: {
        users: userCount,
        consultations: consultationCount,
        activeConsultations,
        applications: applicationCount,
        activeApplications,
        countries: countryCount,
        programs: programCount,
        notifications: notificationCount,
      },
      users: users.data || emptyList,
      consultations: enrichedConsultations,
      applications: enrichedApplications,
      countries: countries.data || emptyList,
      programs: programs.data || emptyList,
      notifications: notifications.data || emptyList,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load admin data" },
      { status: 500 }
    )
  }
}
