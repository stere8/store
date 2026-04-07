import Link from "next/link";
import { redirect } from "next/navigation";
import { loginVendorAction } from "@/app/actions";
import { getDefaultTenantId } from "@/lib/api";
import { readVendorAccessToken } from "@/lib/vendor-session";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
    tenantId?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  if (readVendorAccessToken()) {
    redirect("/dashboard");
  }

  const tenantId = searchParams?.tenantId || getDefaultTenantId();

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel-brand">
        <p className="eyebrow">Frontvendor</p>
        <h1 className="auth-title">Vendor portal access</h1>
        <p className="auth-copy">
          Log in to manage only your products, reservations, and notes. Vendor
          accounts are activated with the admin-issued registration code.
        </p>
        <div className="auth-feature-list">
          <div className="auth-feature-card">
            <strong>Scoped catalog</strong>
            <span>Only your products appear in the dashboard.</span>
          </div>
          <div className="auth-feature-card">
            <strong>Reservation workflow</strong>
            <span>Confirm, complete, reject, and annotate vendor reservations.</span>
          </div>
          <div className="auth-feature-card">
            <strong>Tenant aware</strong>
            <span>Portal requests stay bound to the selected mall tenant.</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div>
          <p className="eyebrow">Sign in</p>
          <h2 className="auth-form-title">Open your vendor dashboard</h2>
          <p className="auth-form-copy">
            Use the email and password created during vendor account activation.
          </p>
        </div>

        {searchParams?.error ? (
          <div className="status-banner error">{searchParams.error}</div>
        ) : null}
        {searchParams?.success ? (
          <div className="status-banner success">{searchParams.success}</div>
        ) : null}

        <form action={loginVendorAction} className="form-grid">
          <div className="field-stack">
            <label htmlFor="tenantId">Tenant</label>
            <input
              id="tenantId"
              name="tenantId"
              defaultValue={tenantId}
              placeholder="kigali-city-mall"
            />
          </div>

          <div className="field-stack">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="vendor@example.com"
            />
          </div>

          <div className="field-stack">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
          </div>

          <button type="submit" className="button button-primary button-wide">
            Log in
          </button>
        </form>

        <p className="auth-footer-copy">
          Need an account first?{" "}
          <Link href={`/register?tenantId=${encodeURIComponent(tenantId)}`} className="text-link">
            Activate with your admin code
          </Link>
        </p>
      </section>
    </main>
  );
}
