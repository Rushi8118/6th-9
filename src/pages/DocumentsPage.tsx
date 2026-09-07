import React, { useState } from 'react'
import { useDocuments, DocumentRow } from '@/hooks/useDocuments'
import { useApplications } from '@/hooks/useApplications'
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Trash2,
  CloudUpload,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function DocumentsPage() {
  const { applications } = useApplications()
  const { documents, uploadDocument, uploadProgress, uploadLoading, deleteDocument } = useDocuments()
  
  const [dragActive, setDragActive] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState('')
  const [customDocName, setCustomDocName] = useState('Passport Copy')

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  // Handle File Input Selection
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0])
    }
  }

  const handleFileSelected = (file: File) => {
    uploadDocument({
      file,
      documentName: customDocName,
      appId: selectedAppId || undefined,
    })
  }

  const getStatusBadge = (status: DocumentRow['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-600/15 px-2.5 py-1 rounded-full border border-emerald-600/30 shrink-0">
            <CheckCircle className="h-3 w-3" aria-hidden="true" /> Verified
          </span>
        )
      case 'Rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-600/15 px-2.5 py-1 rounded-full border border-red-600/30 shrink-0">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-600/15 px-2.5 py-1 rounded-full border border-blue-600/30 shrink-0">
            <CheckCircle className="h-3 w-3" aria-hidden="true" /> Uploaded
          </span>
        )
    }
  }

  const selectClass =
    'w-full h-11 px-3.5 text-sm font-semibold rounded-xl border border-border/60 bg-[var(--ud-canvas)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2'

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm space-y-4" aria-labelledby="upload-heading">
        <h3 id="upload-heading" className="font-serif text-base font-bold text-[var(--ud-ink)]">Upload Secure Files</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="doc-target-app" className="text-xs font-bold text-foreground/75 uppercase tracking-wide">
              Target Application
            </label>
            <select
              id="doc-target-app"
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className={selectClass}
            >
              <option value="">General Documents folder</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.countries?.name} - {app.visa_programs?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="doc-type-name" className="text-xs font-bold text-foreground/75 uppercase tracking-wide">
              Document Type Name
            </label>
            <select
              id="doc-type-name"
              value={customDocName}
              onChange={(e) => setCustomDocName(e.target.value)}
              className={selectClass}
            >
              <option value="Passport Copy">Passport Copy</option>
              <option value="Academic Transcripts">Academic Transcripts</option>
              <option value="IELTS / English Scorecard">IELTS / English Scorecard</option>
              <option value="Work Experience Letters">Work Experience Letters</option>
              <option value="Financial Statements">Financial Proof / Statements</option>
              <option value="Resume / CV">Resume / CV</option>
              <option value="ID Card / Aadhar">National ID Card</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition relative overflow-hidden min-h-[160px] ${
            dragActive
              ? 'border-[var(--ud-copper)] bg-[var(--ud-copper)]/5'
              : 'border-border/70 bg-[var(--ud-canvas)]/10 hover:border-[var(--ud-copper)]/45'
          }`}
        >
          <input
            type="file"
            id="file-upload-input"
            className="hidden"
            accept=".pdf, .jpeg, .jpg, .png"
            onChange={handleFileInput}
            disabled={uploadLoading}
          />
          <label
            htmlFor="file-upload-input"
            className="cursor-pointer flex flex-col items-center gap-2.5 rounded-xl focus-within:outline-none"
          >
            <span className="p-3 bg-[var(--ud-ink)]/5 text-[var(--ud-copper)] rounded-full" aria-hidden="true">
              <CloudUpload className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[var(--ud-ink)]">
                Drag and drop your file here, or <span className="text-[var(--ud-copper)] underline">browse</span>
              </p>
              <p className="text-xs text-foreground/60 mt-1">
                Supports: PDF, JPG, PNG | Max size: 5MB
              </p>
            </div>
          </label>

          {uploadLoading && (
            <div
              className="absolute inset-0 bg-card/90 flex flex-col items-center justify-center p-6 gap-3 z-10"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-bold text-[var(--ud-ink)]">
                Uploading securely… {uploadProgress}%
              </p>
              <Progress value={uploadProgress} className="w-full max-w-xs h-2 bg-[var(--ud-canvas)]" />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 sm:space-y-6" aria-labelledby="repo-heading">
        <h3 id="repo-heading" className="font-serif text-base font-bold text-[var(--ud-ink)] border-b border-border/30 pb-2">
          Your Document Repository
        </h3>

        {documents.length === 0 ? (
          <div className="py-16 text-center bg-card border border-border/50 rounded-2xl shadow-sm">
            <FileText className="h-14 w-14 text-foreground/25 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-foreground/65 font-semibold">No uploaded files found.</p>
            <p className="text-xs text-foreground/55 mt-1">Your uploaded visa credentials will be listed here.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="bg-card border border-border/50 rounded-2xl p-4 flex items-start gap-3.5 justify-between shadow-sm hover:border-[var(--ud-copper)]/35 hover:shadow transition"
              >
                <div className="flex items-start gap-3 overflow-hidden min-w-0">
                  <span className="p-2.5 bg-[var(--ud-canvas)]/50 text-[var(--ud-copper)] rounded-xl shrink-0" aria-hidden="true">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="leading-tight space-y-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-[var(--ud-ink)] truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    {doc.file_size && (
                      <p className="text-xs text-foreground/65">
                        Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                    <span className="text-[11px] text-foreground/55 block">
                      Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <div className="pt-1.5">{getStatusBadge(doc.status)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteDocument({ id: doc.id, filePath: doc.file_path })}
                  className="p-2.5 min-h-10 min-w-10 text-foreground/55 hover:text-red-700 hover:bg-red-50 rounded-full transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2"
                  aria-label={`Delete ${doc.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
