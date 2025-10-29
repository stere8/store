export async function getProducts(tenant = 'mall-a') {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/products`, {
    headers: { 'X-Tenant': tenant },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}
