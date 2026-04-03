"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest, getDefaultTenantId } from "../lib/api";

type Vendor = {
  id: string;
  displayName: string;
  legalName: string;
  active: boolean;
};

type Category = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
};

type Product = {
  id: string;
  vendorId: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  active: boolean;
  createdAt?: string;
};

type ProductDraft = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  stock: string;
  imageUrl: string;
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

export default function VendorDashboard() {
  const [tenantId, setTenantId] = useState(getDefaultTenantId());
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async (nextTenantId = tenantId) => {
    setLoading(true);
    setError("");

    try {
      const [vendorItems, categoryItems, productItems] = await Promise.all([
        apiRequest<Vendor[]>("/api/vendors", nextTenantId),
        apiRequest<Category[]>("/api/categories", nextTenantId),
        apiRequest<Product[]>("/api/products", nextTenantId),
      ]);

      setVendors(vendorItems);
      setCategories(categoryItems);
      setProducts(productItems);
      setSelectedVendorId((current) =>
        current && vendorItems.some((vendor) => vendor.id === current)
          ? current
          : vendorItems[0]?.id || ""
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load vendor catalog data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(tenantId);
  }, [tenantId]);

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) =>
          selectedVendorId ? product.vendorId === selectedVendorId : true
        )
        .sort((left, right) => left.name.localeCompare(right.name)),
    [products, selectedVendorId]
  );

  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId);
  const selectedCategoryName =
    categories.find((category) => category.id === draft.categoryId)?.name ||
    "Uncategorized";

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingProductId(null);
  };

  const startEdit = (product: Product) => {
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
    if (!selectedVendorId) {
      return "Select a vendor before saving a product.";
    }

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
        vendorId: selectedVendorId,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        categoryId: draft.categoryId || null,
        price: Number(draft.price),
        stock: Number(draft.stock),
        imageUrl: draft.imageUrl.trim() || null,
      };

      if (editingProductId) {
        await apiRequest<Product>(`/api/products/${editingProductId}`, tenantId, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Product updated.");
      } else {
        await apiRequest<Product>("/api/products", tenantId, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Product created.");
      }

      resetForm();
      await loadData(tenantId);
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

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Deactivate "${product.name}" for ${selectedVendor?.displayName || "this vendor"}?`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest<void>(`/api/products/${product.id}`, tenantId, {
        method: "DELETE",
      });
      if (editingProductId === product.id) {
        resetForm();
      }
      setSuccess("Product deactivated.");
      await loadData(tenantId);
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

  return (
    <div className="vendor-page">
      <section className="hero-card">
        <div className="hero-top">
          <div>
            <p className="eyebrow">Frontvendor</p>
            <h1 className="hero-title">Vendor product command center</h1>
            <p className="hero-copy">
              Create, edit, and deactivate products against the .NET API. Categories
              are loaded from the live catalog and assigned directly with
              `categoryId`.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <p className="stat-value">{vendors.length}</p>
              <p className="stat-label">Vendors in tenant</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{categories.length}</p>
              <p className="stat-label">Active categories</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{filteredProducts.length}</p>
              <p className="stat-label">Products for vendor</p>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="field">
            <label htmlFor="tenantId">Tenant</label>
            <input
              id="tenantId"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="kigali-city-mall"
            />
          </div>

          <div className="field">
            <label htmlFor="vendorId">Vendor</label>
            <select
              id="vendorId"
              value={selectedVendorId}
              onChange={(event) => setSelectedVendorId(event.target.value)}
            >
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="selectedCategory">Current draft category</label>
            <input id="selectedCategory" value={selectedCategoryName} readOnly />
          </div>

          <div className="button-row">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => loadData(tenantId)}
              disabled={loading || saving}
            >
              Refresh data
            </button>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel-card">
          <h2 className="panel-title">
            {editingProductId ? "Edit product" : "Add product"}
          </h2>
          <p className="panel-copy">
            {editingProductId
              ? "Adjust stock, pricing, or category assignment for the selected product."
              : "Create a new product for the selected vendor."}
          </p>

          {error ? <div className="status-banner error">{error}</div> : null}
          {success ? <div className="status-banner success">{success}</div> : null}

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
          <h2 className="panel-title">Vendor products</h2>
          <p className="panel-copy">
            {selectedVendor
              ? `Showing products for ${selectedVendor.displayName}.`
              : "Select a vendor to manage products."}
          </p>

          {loading ? (
            <div className="empty-state">Loading vendor catalog...</div>
          ) : filteredProducts.length === 0 ? (
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const categoryName =
                    categories.find((category) => category.id === product.categoryId)
                      ?.name || "Uncategorized";

                  return (
                    <tr key={product.id}>
                      <td>
                        <p className="product-name">{product.name}</p>
                        <p className="product-meta">
                          {product.description || "No description provided."}
                        </p>
                      </td>
                      <td>
                        <span className="pill">{categoryName}</span>
                      </td>
                      <td>{currencyFormatter.format(product.price)}</td>
                      <td>{product.stockQuantity}</td>
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
                          <button
                            type="button"
                            className="button button-danger"
                            onClick={() => handleDelete(product)}
                            disabled={saving}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
