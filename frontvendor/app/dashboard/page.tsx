import { redirect } from "next/navigation";
import { logoutVendorAction } from "@/app/actions";
import VendorDashboard from "@/components/vendor-dashboard";
import {
  apiRequest,
  getDefaultTenantId,
  VendorCategory,
  VendorProduct,
  VendorReservation,
  VendorSession,
} from "@/lib/api";
import {
  readVendorAccessToken,
  readVendorTenantId,
} from "@/lib/vendor-session";

const buildLoginRedirect = (tenantId: string, message?: string) => {
  const search = new URLSearchParams();

  if (tenantId) {
    search.set("tenantId", tenantId);
  }

  if (message) {
    search.set("error", message);
  }

  return `/login?${search.toString()}`;
};

export default async function DashboardPage() {
  const accessToken = readVendorAccessToken();
  const tenantId = readVendorTenantId() || getDefaultTenantId();

  if (!accessToken) {
    redirect(buildLoginRedirect(tenantId));
  }

  try {
    const [session, categories, products, reservations] = await Promise.all([
      apiRequest<VendorSession>("/api/vendor-auth/session", tenantId, undefined, accessToken),
      apiRequest<VendorCategory[]>("/api/categories", tenantId, undefined, accessToken),
      apiRequest<VendorProduct[]>("/api/vendor-portal/products", tenantId, undefined, accessToken),
      apiRequest<VendorReservation[]>(
        "/api/vendor-portal/reservations",
        tenantId,
        undefined,
        accessToken
      ),
    ]);

    return (
      <main className="vendor-shell">
        <div className="shell-actions">
          <form action={logoutVendorAction}>
            <button type="submit" className="button button-ghost">
              Log out
            </button>
          </form>
        </div>
        <VendorDashboard
          accessToken={accessToken}
          tenantId={tenantId}
          session={session}
          initialCategories={categories.filter((category) => category.active)}
          initialProducts={products}
          initialReservations={reservations}
        />
      </main>
    );
  } catch {
    redirect(
      buildLoginRedirect(
        tenantId,
        "Your vendor session expired. Please log in again."
      )
    );
  }
}
