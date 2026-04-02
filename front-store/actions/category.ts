"use server";

export const getCategory = async (slug: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/categories?slug=${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch category");

    const data = await res.json();

    return data?.data || null;
  } catch (error) {
    console.error("getCategory error:", error);
    return null; // ✅ NEVER return [];
  }
};

export const getCategories = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();

    return data?.data || [];
  } catch (error) {
    console.error("getCategories error:", error);
    return []; // ✅ NEVER return [];
  }
};