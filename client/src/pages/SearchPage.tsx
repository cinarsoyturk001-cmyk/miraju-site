import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import StoreHeader from "@/components/storefront/StoreHeader";
import { Benefits, ProductCard, StoreFooter } from "@/components/storefront/StoreChrome";
import { addCartItem, products, readCart, writeCart, type CartLine } from "@/data/storefront";

export default function SearchPage() {
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [favorites, setFavorites] = useState<number[]>([]);
  const query = new URLSearchParams(window.location.search).get("q") || "";
  useEffect(() => writeCart(cart), [cart]);
  const results = useMemo(() => products.filter((product) => `${product.name} ${product.category}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))), [query]);
  const addToCart = (product: (typeof products)[number]) => { setCart(addCartItem(product)); toast.success("Sepete eklendi", { description: `${product.name} sepetinize eklendi.`, duration: 2600 }); navigate("/cart"); };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="storefront min-h-screen bg-[#f7f8f6] text-[#202522]"><StoreHeader cartCount={cartCount} /><main className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8"><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#f36f32]">Arama sonuçları</p><h1 className="mt-2 text-4xl font-black tracking-[-.07em] text-[#203f36]">“{query}”</h1><p className="mt-3 text-sm text-[#798079]">{results.length} ürün bulundu</p><section className="mt-8 rounded-3xl bg-white p-5 lg:p-8">{results.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">{results.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} favorite={favorites.includes(product.id)} onFavorite={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} />)}</div> : <div className="py-16 text-center text-sm text-[#798079]">Aramanızla eşleşen ürün bulunamadı.</div>}</section></main><Benefits /><StoreFooter /></div>;
}
