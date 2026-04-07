"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  approveVendor,
  archiveCustomer,
  changeReservationStatus,
  createCategory,
  createLocation,
  createProduct,
  createVendor,
  deleteCustomerIdentityIgnore,
  deleteCategory,
  deleteProduct,
  upsertCustomer,
  upsertCustomerIdentityIgnore,
  updateCategory,
  updateProduct,
  updateReservationNote,
} from "@/lib/estore-api";
import { buildFlashSearch } from "@/lib/admin-ui";
import { deleteClerkUser } from "@/lib/clerk-directory";

const asString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const asNumber = (value: FormDataEntryValue | null) => {
  const raw = typeof value === "string" ? value.trim() : "";
  return Number(raw || 0);
};

const goWithResult = (
  returnTo: string,
  kind: "success" | "error",
  message: string
) => {
  redirect(buildFlashSearch(returnTo, kind, message));
};

export async function createVendorAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/vendors";

  try {
    await createVendor({
      displayName: asString(formData.get("displayName")),
      legalName: asString(formData.get("legalName")),
      contactPhone: asString(formData.get("contactPhone")),
      contactEmail: asString(formData.get("contactEmail")) || undefined,
      description: asString(formData.get("description")) || undefined,
      locationId: asString(formData.get("locationId")) || undefined,
    });
    revalidatePath("/admin/vendors");
    goWithResult(returnTo, "success", "Vendor created.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create vendor.";
    goWithResult(returnTo, "error", message);
  }
}

export async function approveVendorAction(formData: FormData) {
  const vendorId = asString(formData.get("vendorId"));
  const returnTo = asString(formData.get("returnTo")) || "/admin/vendors";

  if (!vendorId) {
    goWithResult(returnTo, "error", "Vendor id is required.");
  }

  try {
    await approveVendor(vendorId);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/vendors");
    revalidatePath(`/admin/vendors/${vendorId}`);
    goWithResult(returnTo, "success", "Vendor verified.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify vendor.";
    goWithResult(returnTo, "error", message);
  }
}

export async function createLocationAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/locations";

  try {
    await createLocation({
      name: asString(formData.get("name")),
      code: asString(formData.get("code")) || undefined,
      description: asString(formData.get("description")) || undefined,
    });
    revalidatePath("/admin/locations");
    revalidatePath("/admin/vendors");
    goWithResult(returnTo, "success", "Location created.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create location.";
    goWithResult(returnTo, "error", message);
  }
}

export async function createCategoryAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/categories";

  try {
    await createCategory({
      name: asString(formData.get("name")),
      description: asString(formData.get("description")) || undefined,
    });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    goWithResult(returnTo, "success", "Category created.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category.";
    goWithResult(returnTo, "error", message);
  }
}

export async function updateCategoryAction(formData: FormData) {
  const id = asString(formData.get("id"));
  const returnTo =
    asString(formData.get("returnTo")) || `/admin/categories/${id}`;

  try {
    await updateCategory(id, {
      name: asString(formData.get("name")),
      description: asString(formData.get("description")) || undefined,
    });
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    goWithResult(returnTo, "success", "Category updated.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category.";
    goWithResult(returnTo, "error", message);
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const id = asString(formData.get("id"));
  const returnTo = asString(formData.get("returnTo")) || "/admin/categories";

  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    goWithResult(returnTo, "success", "Category deleted.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category.";
    goWithResult(returnTo, "error", message);
  }
}

export async function createProductAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/products";

  try {
    await createProduct({
      vendorId: asString(formData.get("vendorId")),
      categoryId: asString(formData.get("categoryId")) || undefined,
      name: asString(formData.get("name")),
      description: asString(formData.get("description")) || undefined,
      price: asNumber(formData.get("price")),
      stock: asNumber(formData.get("stock")),
      imageUrl: asString(formData.get("imageUrl")) || undefined,
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/vendors");
    goWithResult(returnTo, "success", "Product created.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product.";
    goWithResult(returnTo, "error", message);
  }
}

export async function updateProductAction(formData: FormData) {
  const id = asString(formData.get("id"));
  const returnTo =
    asString(formData.get("returnTo")) || `/admin/products/${id}`;

  try {
    await updateProduct(id, {
      vendorId: asString(formData.get("vendorId")),
      categoryId: asString(formData.get("categoryId")) || undefined,
      name: asString(formData.get("name")),
      description: asString(formData.get("description")) || undefined,
      price: asNumber(formData.get("price")),
      stock: asNumber(formData.get("stock")),
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    goWithResult(returnTo, "success", "Product updated.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product.";
    goWithResult(returnTo, "error", message);
  }
}

export async function deleteProductAction(formData: FormData) {
  const id = asString(formData.get("id"));
  const returnTo = asString(formData.get("returnTo")) || "/admin/products";

  try {
    await deleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/admin/vendors");
    goWithResult(returnTo, "success", "Product archived.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to archive product.";
    goWithResult(returnTo, "error", message);
  }
}

export async function syncCustomerFromClerkAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/reconciliation";

  try {
    await upsertCustomer({
      username: asString(formData.get("username")),
      fullName: asString(formData.get("fullName")),
      phoneNumber: asString(formData.get("phoneNumber")),
      email: asString(formData.get("email")) || null,
      preferredLanguage: asString(formData.get("preferredLanguage")) || "en",
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin/reconciliation");
    goWithResult(returnTo, "success", "Customer synced from Clerk into the local database.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync customer from Clerk.";
    goWithResult(returnTo, "error", message);
  }
}

export async function deleteClerkUserAction(formData: FormData) {
  const clerkUserId = asString(formData.get("clerkUserId"));
  const returnTo = asString(formData.get("returnTo")) || "/admin/reconciliation";

  if (!clerkUserId) {
    goWithResult(returnTo, "error", "Clerk user id is required.");
  }

  try {
    await deleteClerkUser(clerkUserId);
    revalidatePath("/admin/reconciliation");
    goWithResult(returnTo, "success", "Clerk user deleted.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete Clerk user.";
    goWithResult(returnTo, "error", message);
  }
}

export async function archiveCustomerAction(formData: FormData) {
  const customerId = asString(formData.get("customerId"));
  const returnTo = asString(formData.get("returnTo")) || "/admin/reconciliation";

  if (!customerId) {
    goWithResult(returnTo, "error", "Customer id is required.");
  }

  try {
    await archiveCustomer(
      customerId,
      asString(formData.get("reason")) || "Archived from admin reconciliation."
    );

    revalidatePath("/admin/customers");
    revalidatePath("/admin/reconciliation");
    goWithResult(returnTo, "success", "Local-only customer archived.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to archive customer.";
    goWithResult(returnTo, "error", message);
  }
}

export async function ignoreCustomerReconciliationIssueAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/reconciliation";

  try {
    await upsertCustomerIdentityIgnore({
      issueType: asString(formData.get("issueType")) as
        | "clerk-only"
        | "db-only"
        | "mismatched",
      subjectKey: asString(formData.get("subjectKey")),
      fingerprint: asString(formData.get("fingerprint")),
    });

    revalidatePath("/admin/reconciliation");
    goWithResult(returnTo, "success", "Issue ignored for the current reconciliation fingerprint.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to ignore issue.";
    goWithResult(returnTo, "error", message);
  }
}

export async function unignoreCustomerReconciliationIssueAction(formData: FormData) {
  const returnTo = asString(formData.get("returnTo")) || "/admin/reconciliation";

  try {
    await deleteCustomerIdentityIgnore(
      asString(formData.get("issueType")) as "clerk-only" | "db-only" | "mismatched",
      asString(formData.get("subjectKey"))
    );

    revalidatePath("/admin/reconciliation");
    goWithResult(returnTo, "success", "Ignored issue restored to the active reconciliation list.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to restore ignored issue.";
    goWithResult(returnTo, "error", message);
  }
}

export async function changeReservationStatusAction(formData: FormData) {
  const id = asString(formData.get("id"));
  const action = asString(formData.get("action")) as
    | "confirm"
    | "complete"
    | "reject"
    | "cancel";
  const returnTo =
    asString(formData.get("returnTo")) || `/admin/reservations/${id}`;

  try {
    await changeReservationStatus(id, action);
    revalidatePath("/admin/reservations");
    revalidatePath(`/admin/reservations/${id}`);
    goWithResult(returnTo, "success", `Reservation ${action}ed.`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update reservation status.";
    goWithResult(returnTo, "error", message);
  }
}

export async function updateReservationNoteAction(formData: FormData) {
  const id = asString(formData.get("id"));
  const returnTo =
    asString(formData.get("returnTo")) || `/admin/reservations/${id}`;

  try {
    await updateReservationNote(id, asString(formData.get("note")));
    revalidatePath("/admin/reservations");
    revalidatePath(`/admin/reservations/${id}`);
    goWithResult(returnTo, "success", "Reservation note updated.");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update reservation note.";
    goWithResult(returnTo, "error", message);
  }
}
