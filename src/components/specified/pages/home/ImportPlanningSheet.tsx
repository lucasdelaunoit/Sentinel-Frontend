import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Upload,
  ImageIcon,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  Camera,
  ZoomIn,
  AlignLeft,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ComposedSheet from "@/components/common/sheets/ComposedSheet"

interface ImportPlanningSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const MAX_SIZE_MB = 15
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const TIPS = [
  {
    icon: LayoutGrid,
    color: "text-primary bg-primary/10",
    title: "Show the full grid",
    desc: "Make sure the entire month view is visible — all days and all employees without scrolling.",
  },
  {
    icon: AlignLeft,
    color: "text-emerald-600 bg-emerald-50",
    title: "Include employee names",
    desc: "The left column with full names must be fully visible and not cut off.",
  },
  {
    icon: ZoomIn,
    color: "text-amber-600 bg-amber-50",
    title: "Use a readable zoom level",
    desc: "Zoom in enough so that cell codes (W, S, B…) are clearly legible.",
  },
  {
    icon: Camera,
    color: "text-violet-600 bg-violet-50",
    title: "Avoid partial captures",
    desc: "Don't scroll mid-capture. Use a full-page export or full-screen screenshot tool.",
  },
]

export default function ImportPlanningSheet({ open, onOpenChange }: ImportPlanningSheetProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type))
      return "Only PNG, JPG or WebP images are accepted."
    if (f.size > MAX_SIZE_BYTES)
      return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`
    return null
  }

  const handleFile = useCallback((f: File) => {
    const err = validate(f)
    if (err) {
      setError(err)
      setFile(null)
      setPreview(null)
      return
    }
    setError(null)
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleFile(dropped)
    },
    [handleFile],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
    e.target.value = ""
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  const handleClose = () => {
    handleRemove()
    setShowTips(false)
  }

  const handleSubmit = () => {
    if (!file) return
    // TODO: send file to API
    handleClose()
    onOpenChange(false)
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Import Planning"
      description="Upload a screenshot of your team planning to sync absences."
      onClose={handleClose}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!file} onClick={handleSubmit}>
            <Upload className="size-4" />
            Import Planning
          </Button>
        </>
      }
    >
      {/* Hidden file input — shared across upload zone & replace button */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Upload zone */}
      {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[210px] p-8 text-center select-none",
                dragOver
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : error
                  ? "border-destructive/50 bg-destructive/5 hover:border-destructive/70"
                  : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl transition-colors",
                  dragOver
                    ? "bg-primary/15"
                    : error
                    ? "bg-destructive/10"
                    : "bg-muted/60",
                )}
              >
                {error ? (
                  <AlertCircle className="size-6 text-destructive" />
                ) : (
                  <ImageIcon
                    className={cn(
                      "size-6",
                      dragOver ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                )}
              </div>

              {dragOver ? (
                <p className="text-sm font-semibold text-primary">Drop it here</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Drag & drop your screenshot
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or{" "}
                      <span className="text-primary font-medium underline underline-offset-2">
                        browse files
                      </span>
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">
                    PNG, JPG, WebP · Max {MAX_SIZE_MB} MB · 1 file
                  </p>
                </>
              )}
            </div>
          ) : (
            /* File preview card */
            <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
              <div className="relative group">
                <img
                  src={preview!}
                  alt="Planning preview"
                  className="w-full object-cover object-top max-h-[220px]"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={handleRemove}
                  className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <X className="size-3.5" />
                </button>
                <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold bg-black/50 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Preview
                </span>
              </div>
              <div className="px-4 py-3 flex items-center gap-3 border-t border-border/40">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200/60">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                    {file.type.split("/")[1].toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-[12px] font-semibold text-primary hover:text-primary/70 transition-colors shrink-0"
                >
                  Replace
                </button>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Tips section */}
          <div className="rounded-2xl border border-border/60 overflow-hidden">
            <button
              onClick={() => setShowTips((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Info className="size-4 text-primary/70 shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  Tips for best results
                </span>
              </div>
              {showTips ? (
                <ChevronUp className="size-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {showTips && (
              <div className="border-t border-border/40 px-4 pb-4 space-y-3">
                <p className="text-[11px] text-muted-foreground pt-3 leading-relaxed">
                  Follow these guidelines to ensure accurate extraction of absences from your
                  planning screenshot.
                </p>

                <div className="space-y-3">
                  {TIPS.map(({ icon: Icon, color, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
                          color,
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Example image */}
                <div className="mt-2 rounded-xl overflow-hidden border border-border/60">
                  <div className="bg-muted/40 px-3 py-2 border-b border-border/40 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Example — good screenshot
                    </p>
                  </div>
                  <img
                    src="/plannings/image (2).png"
                    alt="Example of a good planning screenshot"
                    className="w-full object-cover object-top max-h-[130px]"
                  />
                </div>
              </div>
            )}
          </div>
    </ComposedSheet>
  )
}
