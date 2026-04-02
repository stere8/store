"use server";

export const getProduct = async (slug: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    return data?.[0] || null;
  } catch (error) {
    console.error("getProduct error:", error);
    return null;
  }
};

export const getProducts = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    const mapped = data.map((p: any) => ({
      id: p.id,
      title: p.name,
      price: p.price,
      image: p.imageUrl,
    }));

    console.log(mapped)

    return mapped;
  } catch (error) {
    console.error("getProducts error:", error);
    return [];
  }
};

export const getProductSearch = async (search: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?search=${search}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed");

    return await res.json();
  } catch (error) {
    console.error("search error:", error);
    return [];
  }
};