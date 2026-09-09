"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Calendar,
  MapPin,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type Application = {
  id: string
  application_id: string | null
  user_id: string
  application_type: string
  status: string
  priority: string | null
  country_id: string
  visa_program_id: string
  consultant_notes: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  country: {
    id: string
    name: string
    code: string
    flag_emoji: string | null
  } | null
  program: {
    id: string
    name: string
    program_type: string
  } | null
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/applications/")
        if (!response.ok) throw new Error("Failed to load applications")
        const data = await response.json()
        setApplications(data.applications || [])
      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadApplications()
  }, [])

  const filteredApplications = useMemo(() => {
    let result = applications
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (app) =>
          (app.application_id || "").toLowerCase().includes(q) ||
          (app.user?.full_name || "").toLowerCase().includes(q) ||
          (app.program?.name || "").toLowerCase().includes(q) ||
          (app.country?.name || "").toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter)
    }
    return result
  }, [applications, query, statusFilter])

  const statusColors: Record<string, string> = {
    draft: "secondary",
    submitted: "outline",
    under_review: "default",
    approved: "default",
    rejected: "destructive",
    withdrawn: "secondary",
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowRight className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <span className="font-serif text-lg font-semibold">Applications</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                Applications
              </h1>
              <p className="mt-1 text-muted-foreground">
                {filteredApplications.length} application{filteredApplications.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by application ID, name, program, or country..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </motion.div>

        {filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background py-16">
            <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/applications/${app.id}`}>
                  <Card className="cursor-pointer transition hover:border-primary/40 hover:bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {app.application_id || app.id.slice(0, 8)}
                            </p>
                            <Badge variant={statusColors[app.status] || "secondary"}>
                              {app.status.replace("_", " ")}
                            </Badge>
                            {app.priority && (
                              <Badge variant={
                                app.priority === "urgent" ? "destructive" :
                                app.priority === "high" ? "default" :
                                "outline"
                              }>
                                {app.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {app.user?.full_name || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.country?.name || "-"}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {app.program?.name || "-"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


