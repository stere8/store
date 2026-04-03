"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  changeReservationStatus,
  createCategory,
  createLocation,
  createProduct,
  createVendor,
  deleteCategory,
  deleteProduct,
  updateCategory,
  updateProduct,
  updateReservationNote,
} from "@/lib/estore-api";
import { buildFlashSearch } from "@/lib/admin-ui";

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
