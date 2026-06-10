import { X } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface StatDetailModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function StatDetailModal({ title, onClose, children }: StatDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[82vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-sm">{title}</h2>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground rounded-lg"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}
