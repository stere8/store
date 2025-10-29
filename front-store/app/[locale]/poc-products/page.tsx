import { getProducts } from "@/lib/api";

export default async function PocProductsPage() {
  const products = await getProducts("mall-a");
  return (
    <main style={{padding:"20px"}}>
      <h1>Products (from .NET API)</h1>
      <p style={{opacity:.7}}>Source: {process.env.NEXT_PUBLIC_API}</p>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px"}}>
        {products.map((p: any) => (
          <div key={p.id} style={{border:"1px solid #ddd", borderRadius:8, padding:12}}>
            <div style={{fontWeight:600}}>{p.name}</div>
            <div style={{opacity:.8, fontSize:12}}>{p.description}</div>
            <div style={{marginTop:6}}>Price: {p.price}</div>
            <div style={{fontSize:12}}>Stock: {p.stock}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
