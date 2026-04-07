import Link from "next/link";
import { redirect } from "next/navigation";
import { registerVendorAction } from "@/app/actions";
import { getDefaultTenantId } from "@/lib/api";
import { readVendorAccessToken } from "@/lib/vendor-session";

type RegisterPageProps = {
  searchParams?: {
    error?: string;
    tenantId?: string;
  };
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  if (readVendorAccessToken()) {
    redirect("/dashboard");
  }

  const tenantId = searchParams?.tenantId || getDefaultTenantId();

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel-brand">
        <p className="eyebrow">Activation</p>
        <h1 className="auth-title">Create your vendor account</h1>
        <p className="auth-copy">
          Enter the registration code supplied by admin, then set the email and
          password you will use to access the vendor dashboard.
        </p>
        <div className="auth-callout">
          <strong>What you need</strong>
          <span>The vendor registration code from admin and an email address unique within this tenant.</span>
        </div>
      </section>

      <section className="auth-panel">
        <div>
          <p className="eyebrow">Activate account</p>
          <h2 className="auth-form-title">Bind your vendor profile</h2>
          <p className="auth-form-copy">
            Once activated, the portal will show only your products and reservations.
          </p>
        </div>

        {searchParams?.error ? (
          <div className="status-banner error">{searchParams.error}</div>
        ) : null}

        <form action={registerVendorAction} className="form-grid">
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
            <label htmlFor="registrationCode">Registration code</label>
            <input
              id="registrationCode"
              name="registrationCode"
              required
              placeholder="AB12CD34EF56"
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
            Activate account
          </button>
        </form>

        <p className="auth-footer-copy">
          Already activated?{" "}
          <Link href={`/login?tenantId=${encodeURIComponent(tenantId)}`} className="text-link">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
