export default function AuthBrandPanel() {
  return (
    <aside className="relative hidden lg:flex w-[44%] xl:w-[48%] flex-col justify-between overflow-hidden bg-[#0e0c0b] p-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 0% 0%, rgba(9,113,85,0.35) 0%, rgba(14,12,11,0) 60%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <img src="/logo.svg" alt="Sentinel" className="size-8 select-none" draggable={false} />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Sentinel</p>
          <p className="text-[11px] text-white/40">Risk Intelligence</p>
        </div>
      </div>

      <p className="relative z-10 text-[11px] text-white/30">© {new Date().getFullYear()} Sentinel</p>
    </aside>
  );
}
