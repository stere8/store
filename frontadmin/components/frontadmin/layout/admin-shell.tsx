import type { ReactNode } from "react";
import Link from "next/link";
import type { NavSection } from "@/components/frontadmin/layout/nav-menu";
import { NavMenu } from "@/components/frontadmin/layout/nav-menu";
import { getEStoreApiBaseUrl, getEStoreTenantId } from "@/lib/estore-api";

const sections: NavSection[] = [
  {
    label: "Supported",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/reservations", label: "Reservations" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/reconciliation", label: "Identity Reconciliation" },
      { href: "/admin/locations", label: "Locations" },
    ],
  },
  {
    label: "Planned API Gaps",
    items: [
      { href: "/admin/slides", label: "Campaigns", tone: "planned" },
      { href: "/admin/shippings", label: "Shipping Rules", tone: "planned" },
      { href: "/admin/pmethods", label: "Payment Methods", tone: "planned" },
      { href: "/admin/settings", label: "Tenant Settings", tone: "planned" },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <Link href="/admin/dashboard" className="block">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Frontadmin</p>
            <h1 className="mt-2 text-3xl font-bold text-white">EStore Admin</h1>
            <p className="mt-3 text-sm text-slate-400">
              Admin-only console aligned to EStore.Api. Seller-facing UX moves to a separate
              frontvendor app.
            </p>
          </Link>

          <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-xs text-cyan-100">
            <p className="font-semibold uppercase tracking-[0.24em] text-cyan-300">Runtime</p>
            <p className="mt-2 break-all">API: {getEStoreApiBaseUrl()}</p>
            <p className="mt-1 break-all">Tenant: {getEStoreTenantId()}</p>
          </div>

          <div className="mt-8">
            <NavMenu sections={sections} />
          </div>
        </aside>

        <main className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-4 shadow-2xl shadow-black/20 backdrop-blur lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
