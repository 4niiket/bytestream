import { ReactNode } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 space-y-8 sm:space-y-10 animate-fade-in">{children}</main>

      <footer className="border-t border-border mt-12 sm:mt-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© 2026 Bytestream</span>
          <span>Crafted with care.</span>
        </div>
      </footer>
    </div>
  );
}