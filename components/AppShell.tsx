"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/income", label: "Income" },
  { href: "/expense", label: "Expense" },
  { href: "/dashboard/purchase", label: "Purchase" },
  { href: "/dues", label: "Dues" },
  { href: "/reports", label: "Reports" },
  { href: "/dashboard/settings/company", label: "Settings" },
];

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const currentLabel = useMemo(
    () => navItems.find((item) => pathname?.startsWith(item.href))?.label || "App",
    [pathname]
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 px-5 py-5 shadow-lg backdrop-blur",
            "transform transition-transform duration-300 md:sticky md:translate-x-0 md:shadow-none",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          ].join(" ")}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Finance
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">
                Accounting App
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
              aria-label="Close navigation"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {mobileNavOpen ? (
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col md:pl-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm"
              >
                <MenuIcon />
                Menu
              </button>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Current
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {currentLabel}
                </p>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
