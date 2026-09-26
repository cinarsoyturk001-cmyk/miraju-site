import { useEffect, useState } from "react";
import { ArrowRight, BadgePercent, Check, Sparkles, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import StoreHeader from "@/components/storefront/StoreHeader";
import { Benefits, ProductCard, StoreFooter } from "@/components/storefront/StoreChrome";
import { addCartItem, categories, products, readCart, writeCart, type CartLine } from "@/data/storefront";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const favoriteQuery = trpc.storefront.favorites.useQuery(undefined, { enabled: isAuthenticated });
  const favoriteMutation = trpc.storefront.setFavorite.useMutation();
  const [favorites, setFavorites] = useState<number[]>([]);
  useEffect(() => writeCart(cart), [cart]);
  useEffect(() => { if (favoriteQuery.data) setFavorites(favoriteQuery.data); }, [favoriteQuery.data]);

  const addToCart = (product: (typeof products)[number]) => { setCart(addCartItem(product)); toast.success("Sepete eklendi", { description: `${product.name} sepetinize eklendi.`, duration: 2600 }); navigate("/cart"); };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (id: number) => {
    if (!isAuthenticated) { navigate("/account"); return; }
    const next = favorites.includes(id) ? favorites.filter((favoriteId) => favoriteId !== id) : [...favorites, id];
    setFavorites(next);
    favoriteMutation.mutate({ productId: id, favorite: next.includes(id) });
  };

  return (
    <div className="storefront min-h-screen overflow-x-hidden bg-[#f7f8f6] text-[#202522]">
      <StoreHeader cartCount={cartCount} />
      <main>
        <section className="mx-auto grid max-w-[1400px] gap-4 px-4 pb-5 pt-4 lg:grid-cols-[1.55fr_1fr] lg:px-8 lg:pb-8 lg:pt-8">
          <div className="hero-panel relative min-h-[475px] overflow-hidden rounded-[2rem] bg-[#dce9e2] px-7 py-10 sm:px-12 lg:min-h-[545px] lg:py-16">
            <div className="hero-grid absolute inset-0 opacity-40" />
            <div className="relative z-10 max-w-[510px]">
              <p className="mb-6 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.2em] text-[#f36f32]"><Sparkles size={15} fill="currentColor" /> Yeni çalışma sezonu</p>
              <h1 className="max-w-[540px] text-[clamp(3rem,6vw,6.15rem)] font-black leading-[.91] tracking-[-.085em] text-[#203f36]">İşini<br /><span className="text-[#f36f32]">büyüten</span><br />detaylar.</h1>
              <p className="mt-7 max-w-[390px] text-[15px] leading-7 text-[#53635a]">Ofisinizi daha üretken, daha düzenli ve daha iyi hissettiren ürünlerle yeniden düşünün.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4"><Link href="/category/kirtasiye" className="group inline-flex items-center gap-3 rounded-xl bg-[#203f36] px-5 py-3.5 text-xs font-extrabold text-white shadow-[0_10px_25px_rgba(32,63,54,.18)] transition hover:-translate-y-0.5 hover:bg-[#152f27]">Koleksiyonu keşfet <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link><span className="text-[11px] font-bold text-[#607068]">500 TL üzeri ücretsiz kargo</span></div>
            </div>
            <div className="absolute -bottom-12 -right-20 h-[310px] w-[310px] rounded-full bg-[#bdd7c8] lg:h-[470px] lg:w-[470px]" />
            <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=90" alt="Modern çalışma alanı" loading="eager" fetchPriority="high" decoding="async" className="hero-image absolute bottom-0 right-0 h-[59%] w-[47%] object-cover object-left opacity-45 mix-blend-multiply lg:h-[84%] lg:w-[48%] lg:opacity-100" />
            <div className="absolute bottom-6 right-7 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#203f36] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#f36f32]" /> MİRAJU / OFFICE EDIT</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="editorial-card relative min-h-[255px] overflow-hidden rounded-[2rem] bg-[#f8dfd2] p-7"><div className="relative z-10 max-w-[250px]"><p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#b94d21]"><BadgePercent size={14} /> Haftanın fırsatı</p><h2 className="mt-4 text-3xl font-black leading-[.98] tracking-[-.06em] text-[#70331f]">Kırtasiyede<br />büyük indirim.</h2><Link href="/category/kirtasiye" className="mt-6 inline-flex items-center gap-1 text-xs font-extrabold text-[#70331f] underline decoration-[#d48b68] underline-offset-4">Alışverişe başla <ArrowRight size={14} /></Link></div><img src="https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=650&q=85" alt="Kırtasiye ürünleri" loading="lazy" decoding="async" className="editorial-image absolute -bottom-5 -right-5 h-[190px] w-[245px] rotate-[-8deg] object-cover mix-blend-multiply" /></div>
            <Link href="/quote" className="group flex min-h-[255px] flex-col justify-between rounded-[2rem] bg-[#203f36] p-7 text-white shadow-[0_14px_32px_rgba(32,63,54,.13)] transition hover:-translate-y-1"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#a9d7bc]">Kurumsal alışveriş</p><h2 className="mt-4 max-w-[290px] text-[2rem] font-black leading-[1.02] tracking-[-.06em]">İşletmenize özel<br /><span className="text-[#f7c4a9]">avantajlı fiyatlar.</span></h2></div><span className="flex items-center gap-2 text-xs font-bold text-[#f7c4a9]">Teklif iste <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14"><div className="mb-6 flex items-end justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#f36f32]">İhtiyacınız ne olursa olsun</p><h2 className="mt-2 text-3xl font-black tracking-[-.07em] text-[#203f36] sm:text-4xl">Alanınızı iyi seçin.</h2></div><Link href="/category/kirtasiye" className="hidden items-center gap-2 text-xs font-bold text-[#203f36] transition hover:text-[#f36f32] sm:flex">Tüm kategoriler <ArrowRight size={15} /></Link></div><div className="no-scrollbar flex gap-3 overflow-x-auto pb-3">{categories.map((category, index) => <Link key={category.slug} href={`/category/${category.slug}`} className="category-card group relative min-w-[190px] flex-1 overflow-hidden rounded-[1.35rem] p-4 text-left" style={{ backgroundColor: category.accent }}><div className="relative z-10"><span className="text-[10px] font-extrabold text-[#708078]">0{index + 1}</span><h3 className="mt-7 text-sm font-extrabold text-[#203f36]">{category.name}</h3><p className="mt-1 text-[11px] text-[#607068]">{category.count}</p></div><img src={category.image} alt="" loading="lazy" decoding="async" className="mt-4 h-28 w-full rounded-xl object-cover mix-blend-multiply opacity-90 transition duration-500 group-hover:scale-105" /></Link>)}</div></section>

        <section className="border-y border-[#e5e7e3] bg-white"><div className="mx-auto max-w-[1400px] px-4 py-12 lg:px-8 lg:py-16"><div className="mb-8 flex items-end justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#f36f32]">Size özel seçtiklerimiz</p><h2 className="mt-2 text-3xl font-black tracking-[-.07em] text-[#203f36] sm:text-4xl">Çok satanlar</h2></div><div className="hidden items-center gap-2 text-[11px] font-bold text-[#798079] sm:flex"><Check size={15} className="text-[#f36f32]" /> Ofislerin favorileri</div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} />)}</div></div></section>
        <section className="mx-auto max-w-[1400px] px-4 py-5 lg:px-8"><div className="flex flex-col justify-between gap-5 rounded-[1.5rem] bg-[#f5ead8] p-6 sm:flex-row sm:items-center sm:px-8"><div><p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#9b6c37]"><Zap size={14} fill="currentColor" /> Miraju edit</p><h2 className="mt-2 text-xl font-black tracking-[-.04em] text-[#634624]">İyi bir çalışma günü, iyi bir kahveyle başlar.</h2></div><Link href="/category/kahve-ikram" className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#634624] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#4d361d]">Kahve köşesine git <ArrowRight size={15} /></Link></div></section>
        <Benefits />
      </main>
      <StoreFooter />
    </div>
  );
}
