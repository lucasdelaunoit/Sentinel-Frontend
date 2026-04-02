import { Bell, ChevronRight, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Sentinel</span>
          <ChevronRight className="size-3" />
          <span>Overview</span>
        </div>
        <h1 className="text-xl font-bold text-foreground leading-tight">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 bg-foreground text-background hover:bg-foreground/85 h-8 px-3 text-sm"
        >
          <PlusCircle className="size-3.5" />
          Simulate Leave
        </Button>
        <Button variant="outline" size="icon" className="size-8 relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500" />
        </Button>
      </div>
    </header>
  )
}
