"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ArrowRight,
  FileUp,
  Activity,
  Shield,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

type DocStatus = "Uploaded" | "Missing" | "Rejected" | "Verified"

type Document = {
  id: string
  name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  status: DocStatus
  notes: string | null
  created_at: string
  updated_at: string
}

type Activity = {
  id: string
  application_id: string
  actor_id: string | null
  action: string
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type ApplicationDetailData = {
  application: {
    id: string
    application_id: string | null
    user_id: string
    visa_program_id: string
    country_id: string
    application_type: string
    status: string
    priority: string | null
    personal_info: Record<string, unknown> | null
    education_history: unknown[] | null
    work_history: unknown[] | null
    document_checklist: Record<string, unknown> | null
    submitted_at: string | null
    review_started_at: string | null
    decision_at: string | null
    estimated_completion: string | null
    assigned_consultant: string | null
    consultant_notes: string | null
    meta: Record<string, unknown> | null
    created_at: string
    updated_at: string
  }
  applicant: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
    nationality: string | null
    current_city: string | null
    education_level: string | null
    field_of_study: string | null
    user_role: string
    status: string
  } | null
  country: {
    id: string
    name: string
    code: string
    flag_emoji: string | null
  } | null
  visa_program: {
    id: string
    name: string
    program_type: string
    description: string | null
  } | null
  assigned_officer: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  documents: Document[]
  activity: Activity[]
}

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, profile, isAdmin } = useAuth()
  const [data, setData] = useState<ApplicationDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [rpcError, setRpcError] = useState(false)

  useEffect(() => {
    async function loadApplication() {
      try {
        const response = await fetch(`/api/applications/${params.id}/`)
        if (!response.ok) {
          throw new Error("Failed to load application")
        }
        const result = await response.json()
        setData(result as ApplicationDetailData)
        setRpcError(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to load application details")
        try {
          const res = await fetch(`/api/applications/${params.id}/`)
          const basic = await res.json()
          const app = basic.application || basic
          setData({
            application: app,
            applicant: null,
            country: null,
            visa_program: null,
            assigned_officer: null,
            documents: [],
            activity: [],
          } as ApplicationDetailData)
          setRpcError(true)
        } catch {
          setRpcError(true)
        }
      } finally {
        setLoading(false)
      }
    }
    loadApplication()
  }, [params.id])

  async function handleAction(action: string) {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${params.id}/action/`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, reason: noteText || null }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Action failed")
      }
      toast.success(`Application ${action} successfully`)
      setNoteText("")
      const res = await fetch(`/api/applications/${params.id}/`)
      const data = await res.json()
      setData(data as ApplicationDetailData)
    } catch (err: any) {
      toast.error(err?.message || "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) {
      toast.error("Please enter a note")
      return
    }
    await handleAction("add_note")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Application not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { application, applicant, country, visa_program, assigned_officer, documents, activity } = data

  if (rpcError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <span className="font-serif text-lg font-semibold">{application.application_id || application.id?.slice(0, 8)}</span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-serif text-lg font-semibold text-amber-700">Database migration pending</h2>
            </div>
            <p className="text-sm text-amber-600">
              The application management system hasn&apos;t been deployed to the database yet. 
              Please run the Supabase migrations to enable full functionality including documents, 
              activity logs, and detailed application views. 
              <br />
              <br />
              <strong>Run:</strong> <code>supabase db push</code> or execute the migration file 
              <code>supabase/migrations/20260909000005_application_management_workspace.sql</code> in the Supabase dashboard.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Application ID</p><p className="font-medium">{application.application_id || application.id?.slice(0, 8)}</p></div>
              <div><p className="text-muted-foreground">Type</p><p className="capitalize">{application.application_type}</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="capitalize">{application.status}</p></div>
              <div><p className="text-muted-foreground">Priority</p><p>{application.priority || "normal"}</p></div>
              <div><p className="text-muted-foreground">Created</p><p>{new Date(application.created_at).toLocaleString()}</p></div>
              <div><p className="text-muted-foreground">Updated</p><p>{new Date(application.updated_at).toLocaleString()}</p></div>
              {application.consultant_notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="text-sm">{application.consultant_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    draft: "secondary",
    submitted: "outline",
    under_review: "default",
    approved: "default",
    rejected: "destructive",
    withdrawn: "secondary",
  }

  const priorityColors: Record<string, string> = {
    low: "secondary",
    normal: "outline",
    high: "default",
    urgent: "destructive",
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <span className="font-serif text-lg font-semibold">
              {application.application_id || application.id.slice(0, 8)}
            </span>
            <Badge variant={statusColors[application.status] || "secondary"}>
              {application.status.replace("_", " ")}
            </Badge>
            {application.priority && (
              <Badge variant={priorityColors[application.priority || "normal"] || "outline"}>
                {application.priority}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.refresh()}
              >
                Refresh
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Applicant Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl">
                  {applicant?.full_name || "Applicant"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {applicant?.email} • {applicant?.phone || "No phone"}
                </p>
              </div>
            </CardHeader>
            {applicant && (
              <CardContent className="grid grid-cols-2 gap-4 pt-0 text-sm">
                <div>
                  <p className="text-muted-foreground">Nationality</p>
                  <p>{applicant.nationality || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current City</p>
                  <p>{applicant.current_city || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Education Level</p>
                  <p>{applicant.education_level || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Field of Study</p>
                  <p>{applicant.field_of_study || "-"}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Application Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Application Type</p>
                <p className="capitalize font-medium">{application.application_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Country</p>
                <p>
                  {country ? (
                    <>
                      {country.flag_emoji} {country.name}
                    </>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Visa Program</p>
                <p>{visa_program?.name || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Program Type</p>
                <p>{visa_program?.program_type?.replace("_", " ") || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p>{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Review Started</p>
                <p>{application.review_started_at ? new Date(application.review_started_at).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Decision</p>
                <p>{application.decision_at ? new Date(application.decision_at).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Completion</p>
                <p>{application.estimated_completion || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Officer</p>
                <p>{assigned_officer?.full_name || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(application.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="history">Education & Work</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.personal_info ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(application.personal_info as Record<string, unknown>).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                          <p className="font-medium">
                            {typeof value === "object" ? JSON.stringify(value) : String(value || "-")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No personal information provided.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <CardTitle className="font-serif text-lg">Education History</CardTitle>
                </CardHeader>
                <CardContent>
                  {(application.education_history && application.education_history.length > 0) ? (
                    <div className="space-y-4">
                      {(application.education_history as unknown[]).map((edu: unknown, idx: number) => (
                        <div key={idx} className="rounded-lg border border-border/50 bg-background p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(edu as Record<string, unknown>).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                                <p className="font-medium">{String(value || "-")}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No education history provided.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle className="font-serif text-lg">Work History</CardTitle>
                </CardHeader>
                <CardContent>
                  {(application.work_history && application.work_history.length > 0) ? (
                    <div className="space-y-4">
                      {(application.work_history as unknown[]).map((work: unknown, idx: number) => (
                        <div key={idx} className="rounded-lg border border-border/50 bg-background p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(work as Record<string, unknown>).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                                <p className="font-medium">{String(value || "-")}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No work history provided.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="documents">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-primary" />
                    Documents ({documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.file_type && (
                                  <>
                                    {doc.file_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ""}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              doc.status === "Verified" ? "default" :
                              doc.status === "Rejected" ? "destructive" :
                              doc.status === "Missing" ? "outline" :
                              "secondary"
                            }>
                              {doc.status}
                            </Badge>
                            {doc.notes && (
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="activity">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="font-serif text-lg">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.length > 0 ? (
                    <div className="space-y-3">
                      {activity.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium capitalize">{item.action.replace(/_/g, " ")}</p>
                              <Badge variant="outline" className="text-xs">
                                {new Date(item.created_at).toLocaleDateString()}
                              </Badge>
                            </div>
                            {item.reason && (
                              <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                            )}
                            {item.metadata && Object.keys(item.metadata).length > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {JSON.stringify(item.metadata)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No activity recorded yet.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Admin Actions */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  Application Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading || application.status === "approved"}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading || application.status === "rejected"}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("return_for_corrections")}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Return for Corrections
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("request_documents")}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Request Documents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("archive")}
                    disabled={actionLoading}
                  >
                    Archive
                  </Button>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note or reason for this action..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddNote}
                      disabled={actionLoading || !noteText.trim()}
                      className="gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Consultant Notes */}
        {application.consultant_notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="font-serif text-lg">Consultant Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.consultant_notes}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
