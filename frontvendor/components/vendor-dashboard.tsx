"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  apiRequest,
  VendorCategory,
  VendorProduct,
  VendorReservation,
  VendorSession,
} from "@/lib/api";

type ProductDraft = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  stock: string;
  imageUrl: string;
};

type ReservationStatusAction = {
  label: string;
  status: VendorReservation["status"];
};

const emptyDraft: ProductDraft = {
  name: "",
  description: "",
  categoryId: "",
  price: "",
  stock: "",
  imageUrl: "",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const reservationActionsByStatus: Record<
  VendorReservation["status"],
  ReservationStatusAction[]
> = {
  Pending: [
    { label: "Confirm", status: "Confirmed" },
    { label: "Reject", status: "Rejected" },
    { label: "Cancel", status: "Cancelled" },
  ],
  Confirmed: [
    { label: "Complete", status: "Completed" },
    { label: "Cancel", status: "Cancelled" },
  ],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};

const buildNoteDrafts = (items: VendorReservation[]) =>
  Object.fromEntries(
    items.map((reservation) => [reservation.id, reservation.vendorNotes || ""])
  );

const formatDateTime = (value?: string | null) =>
  value ? dateTimeFormatter.format(new Date(value)) : "Not set";

export default function VendorDashboard({
  accessToken,
  tenantId,
  session,
  initialCategories,
  initialProducts,
  initialReservations,
}: {
  accessToken: string;
  tenantId: string;
  session: VendorSession;
  initialCategories: VendorCategory[];
  initialProducts: VendorProduct[];
  initialReservations: VendorReservation[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [reservations, setReservations] = useState(initialReservations);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [reservationNotes, setReservationNotes] = useState<Record<string, string>>(
    buildNoteDrafts(initialReservations)
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [categoryItems, productItems, reservationItems] = await Promise.all([
        apiRequest<VendorCategory[]>("/api/categories", tenantId, undefined, accessToken),
        apiRequest<VendorProduct[]>(
          "/api/vendor-portal/products",
          tenantId,
          undefined,
          accessToken
        ),
        apiRequest<VendorReservation[]>(
          "/api/vendor-portal/reservations",
          tenantId,
          undefined,
          accessToken
        ),
      ]);

      setCategories(categoryItems.filter((category) => category.active));
      setProducts(productItems);
      setReservations(reservationItems);
      setReservationNotes(buildNoteDrafts(reservationItems));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to refresh vendor dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = useMemo(
    () =>
      [...products].sort((left, right) => {
        if (left.active !== right.active) {
          return left.active ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      }),
    [products]
  );

  const sortedReservations = useMemo(
    () =>
      [...reservations].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [reservations]
  );

  const pendingReservations = sortedReservations.filter(
    (reservation) => reservation.status === "Pending"
  );
  const reservedUnits = sortedProducts.reduce(
    (sum, product) => sum + product.reservedQuantity,
    0
  );

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingProductId(null);
  };

  const startEdit = (product: VendorProduct) => {
    setEditingProductId(product.id);
    setDraft({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId || "",
      price: String(product.price),
      stock: String(product.stockQuantity),
      imageUrl: product.imageUrl || "",
    });
    setSuccess("");
    setError("");
  };

  const validateDraft = () => {
    if (!draft.name.trim()) {
      return "Product name is required.";
    }

    const price = Number(draft.price);
    if (Number.isNaN(price) || price < 0) {
      return "Price must be zero or greater.";
    }

    const stock = Number(draft.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return "Stock must be a whole number zero or greater.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        categoryId: draft.categoryId || null,
        price: Number(draft.price),
        stock: Number(draft.stock),
        imageUrl: draft.imageUrl.trim() || null,
      };

      if (editingProductId) {
        await apiRequest<VendorProduct>(
          `/api/vendor-portal/products/${editingProductId}`,
          tenantId,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          accessToken
        );
        setSuccess("Product updated.");
      } else {
        await apiRequest<VendorProduct>(
          "/api/vendor-portal/products",
          tenantId,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          accessToken
        );
        setSuccess("Product created.");
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: VendorProduct) => {
    const confirmed = window.confirm(`Deactivate "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest<void>(
        `/api/vendor-portal/products/${product.id}`,
        tenantId,
        {
          method: "DELETE",
        },
        accessToken
      );

      if (editingProductId === product.id) {
        resetForm();
      }

      setSuccess("Product deactivated.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to deactivate the product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReservationStatus = async (
    reservationId: string,
    status: VendorReservation["status"]
  ) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest<VendorReservation>(
        `/api/vendor-portal/reservations/${reservationId}/status?status=${encodeURIComponent(
          status
        )}`,
        tenantId,
        {
          method: "PATCH",
        },
        accessToken
      );

      setSuccess(`Reservation marked as ${status.toLowerCase()}.`);
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the reservation."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReservationNoteSave = async (reservationId: string) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest<VendorReservation>(
        `/api/vendor-portal/reservations/${reservationId}/note`,
        tenantId,
        {
          method: "PATCH",
          body: JSON.stringify({
            note: reservationNotes[reservationId] || "",
          }),
        },
        accessToken
      );

      setSuccess("Vendor note saved.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the vendor note."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vendor-page">
      <section className="hero-card">
        <div className="hero-top">
          <div>
            <p className="eyebrow">Vendor dashboard</p>
            <h1 className="hero-title">{session.displayName}</h1>
            <p className="hero-copy">
              Logged in as {session.accountEmail || session.contactEmail || session.displayName}.
              This workspace is locked to your vendor profile and tenant.
            </p>
          </div>

          <div className="hero-meta">
            <span className="pill">Tenant: {tenantId}</span>
            <span className="pill">
              Verification: {session.verified ? "Verified" : "Pending"}
            </span>
            <span className="pill">
              Last login: {formatDateTime(session.lastLoginAt || session.accountRegisteredAt)}
            </span>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <p className="stat-value">{sortedProducts.length}</p>
            <p className="stat-label">Products in your catalog</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{pendingReservations.length}</p>
            <p className="stat-label">Pending reservations</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{reservedUnits}</p>
            <p className="stat-label">Units currently reserved</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="field">
            <label htmlFor="vendorName">Vendor</label>
            <input id="vendorName" value={session.displayName} readOnly />
          </div>

          <div className="field">
            <label htmlFor="accountEmail">Portal email</label>
            <input
              id="accountEmail"
              value={session.accountEmail || session.contactEmail || "Not set"}
              readOnly
            />
          </div>

          <div className="field">
            <label htmlFor="contactPhone">Phone</label>
            <input id="contactPhone" value={session.contactPhone} readOnly />
          </div>

          <div className="button-row">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => void loadData()}
              disabled={loading || saving}
            >
              Refresh data
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="status-banner error">{error}</div> : null}
      {success ? <div className="status-banner success">{success}</div> : null}

      <div className="dashboard-grid">
        <section className="panel-card">
          <h2 className="panel-title">
            {editingProductId ? "Edit product" : "Add product"}
          </h2>
          <p className="panel-copy">
            Maintain your own catalog without crossing into other vendors&apos; inventory.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-stack">
              <label htmlFor="name">Product name</label>
              <input
                id="name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Wireless speaker"
              />
            </div>

            <div className="field-stack">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Short storefront description"
              />
            </div>

            <div className="grid-two">
              <div className="field-stack">
                <label htmlFor="categoryId">Category</label>
                <select
                  id="categoryId"
                  value={draft.categoryId}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-stack">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  id="imageUrl"
                  value={draft.imageUrl}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid-two">
              <div className="field-stack">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, price: event.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="field-stack">
                <label htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={draft.stock}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, stock: event.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="button-row">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving || loading}
              >
                {saving
                  ? "Saving..."
                  : editingProductId
                    ? "Update product"
                    : "Create product"}
              </button>

              <button
                type="button"
                className="button button-ghost"
                onClick={resetForm}
                disabled={saving}
              >
                Clear form
              </button>
            </div>
          </form>
        </section>

        <section className="panel-card">
          <div className="section-header">
            <div>
              <h2 className="panel-title">Your products</h2>
              <p className="panel-copy">
                Active and inactive catalog items assigned to {session.displayName}.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading products...</div>
          ) : sortedProducts.length === 0 ? (
            <div className="empty-state">
              No products found for this vendor yet. Create one from the form.
            </div>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Reserved</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <p className="product-name">{product.name}</p>
                      <p className="product-meta">
                        {product.description || "No description provided."}
                      </p>
                    </td>
                    <td>
                      <span className="pill">{product.category || "Uncategorized"}</span>
                    </td>
                    <td>{currencyFormatter.format(product.price)}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.reservedQuantity}</td>
                    <td>
                      <span className="pill">
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => startEdit(product)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        {product.active ? (
                          <button
                            type="button"
                            className="button button-danger"
                            onClick={() => void handleDelete(product)}
                            disabled={saving}
                          >
                            Deactivate
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="panel-card">
        <div className="section-header">
          <div>
            <h2 className="panel-title">Your reservations</h2>
            <p className="panel-copy">
              Only reservations assigned to {session.displayName} are visible here.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading reservations...</div>
        ) : sortedReservations.length === 0 ? (
          <div className="empty-state">No reservations are assigned to this vendor yet.</div>
        ) : (
          <div className="reservation-grid">
            {sortedReservations.map((reservation) => {
              const itemSummary = (reservation.items || [])
                .map((item) => `${item.product?.name || item.productId} x${item.quantity}`)
                .join(", ");
              const nextActions = reservationActionsByStatus[reservation.status];

              return (
                <article key={reservation.id} className="reservation-card">
                  <div className="reservation-header">
                    <div>
                      <p className="product-name">{reservation.reservationNumber}</p>
                      <p className="product-meta">
                        Pickup code {reservation.pickupCode} • {formatDateTime(reservation.createdAt)}
                      </p>
                    </div>
                    <div className="reservation-meta">
                      <span className="pill">{reservation.status}</span>
                      <strong>{currencyFormatter.format(reservation.totalAmount)}</strong>
                    </div>
                  </div>

                  <div className="meta-list">
                    <p>
                      <strong>Customer:</strong>{" "}
                      {reservation.customer?.fullName || "Customer"}{" "}
                      {reservation.customer?.phoneNumber
                        ? `(${reservation.customer.phoneNumber})`
                        : ""}
                    </p>
                    <p>
                      <strong>Expires:</strong> {formatDateTime(reservation.expiresAt)}
                    </p>
                    <p>
                      <strong>Items:</strong> {itemSummary || "No items attached."}
                    </p>
                    {reservation.customerNotes ? (
                      <p>
                        <strong>Customer note:</strong> {reservation.customerNotes}
                      </p>
                    ) : null}
                  </div>

                  <div className="note-block">
                    <label htmlFor={`note-${reservation.id}`}>Vendor note</label>
                    <textarea
                      id={`note-${reservation.id}`}
                      value={reservationNotes[reservation.id] || ""}
                      onChange={(event) =>
                        setReservationNotes((current) => ({
                          ...current,
                          [reservation.id]: event.target.value,
                        }))
                      }
                      placeholder="Internal pickup note"
                    />
                  </div>

                  <div className="actions">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => void handleReservationNoteSave(reservation.id)}
                      disabled={saving}
                    >
                      Save note
                    </button>

                    {nextActions.map((action) => (
                      <button
                        key={`${reservation.id}-${action.status}`}
                        type="button"
                        className={
                          action.status === "Rejected" || action.status === "Cancelled"
                            ? "button button-danger"
                            : "button button-primary"
                        }
                        onClick={() =>
                          void handleReservationStatus(reservation.id, action.status)
                        }
                        disabled={saving}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
