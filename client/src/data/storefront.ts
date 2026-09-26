export type Category = { name: string; count: string; image: string; accent: string; slug: string };
export type Product = { id: number; name: string; category: string; brand: string; features: string[]; price: number; oldPrice?: number; image: string; badge?: string; rating: string };
export type CartLine = Product & { quantity: number };
export type OrderRecord = { id: string; createdAt: string; total: number; itemCount: number; status: "Hazırlanıyor" | "Tamamlandı" };
export type ReviewRecord = { id: string; productId: number; author: string; rating: number; text: string; createdAt: string };

export const categories: Category[] = [
  { name: "Kırtasiye", count: "1.240 ürün", slug: "kirtasiye", image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=85", accent: "#ffe3d3" },
  { name: "Ofis Mobilyaları", count: "860 ürün", slug: "ofis-mobilyalari", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85", accent: "#dcefe8" },
  { name: "Temizlik", count: "520 ürün", slug: "temizlik", image: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=700&q=85", accent: "#e3f1f4" },
  { name: "Kahve & İkram", count: "390 ürün", slug: "kahve-ikram", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=700&q=85", accent: "#f5ead8" },
  { name: "Kozmetik", count: "680 ürün", slug: "kozmetik", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85", accent: "#f2dce8" },
];

export const products: Product[] = [
  { id: 1, name: "Navigator A4 Fotokopi Kağıdı 80 gr", category: "Kırtasiye", brand: "Navigator", features: ["A4", "Geri dönüştürülmüş"], price: 189, oldPrice: 229, image: "https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=700&q=85", badge: "%17 İNDİRİM", rating: "4.9" },
  { id: 3, name: "Mira Fileli Çalışma Koltuğu", category: "Ofis Mobilyaları", brand: "Mira", features: ["Ergonomik", "Ayarlanabilir"], price: 4290, oldPrice: 5290, image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=700&q=85", badge: "YENİ", rating: "4.7" },
  { id: 4, name: "Nescafé Gold Kavanoz Kahve 100 gr", category: "Kahve & İkram", brand: "Nescafé", features: ["Gold", "Kavanoz"], price: 249, image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=700&q=85", rating: "4.9" },
  { id: 5, name: "Post-it Yapışkanlı Not Kağıdı Neon", category: "Kırtasiye", brand: "Post-it", features: ["Neon", "Yapışkanlı"], price: 79, oldPrice: 99, image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=85", badge: "FIRSAT", rating: "4.8" },
  { id: 6, name: "Profesyonel Manikür & Bakım Seti", category: "Kozmetik", brand: "Miraju", features: ["Profesyonel", "Bakım"], price: 349, oldPrice: 429, image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=85", badge: "YENİ", rating: "4.9" },
];

export const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
export const cartItemCount = (cart: CartLine[]) => cart.reduce((sum, item) => sum + item.quantity, 0);
export const cartTotal = (cart: CartLine[]) => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const slugToCategory = (slug?: string) => categories.find((category) => category.slug === slug)?.name;

export function readCart(): CartLine[] {
  try { return JSON.parse(localStorage.getItem("miraju-cart") || "[]"); } catch { return []; }
}

export function writeCart(cart: CartLine[]) { localStorage.setItem("miraju-cart", JSON.stringify(cart)); }

export function addCartItem(product: Product): CartLine[] {
  const current = readCart();
  const found = current.find((item) => item.id === product.id);
  const next = found
    ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...current, { ...product, quantity: 1 }];
  writeCart(next);
  return next;
}

const userKey = (prefix: string, openId: string) => `miraju-${prefix}-${openId}`;
export function readFavorites(openId?: string): number[] {
  if (!openId) return [];
  try { return JSON.parse(localStorage.getItem(userKey("favorites", openId)) || "[]"); } catch { return []; }
}
export function writeFavorites(openId: string | undefined, favorites: number[]) {
  if (openId) localStorage.setItem(userKey("favorites", openId), JSON.stringify(favorites));
}
export function readOrders(openId?: string): OrderRecord[] {
  if (!openId) return [];
  try { return JSON.parse(localStorage.getItem(userKey("orders", openId)) || "[]"); } catch { return []; }
}
export function writeOrder(openId: string | undefined, order: OrderRecord) {
  if (!openId) return;
  const orders = readOrders(openId);
  localStorage.setItem(userKey("orders", openId), JSON.stringify([order, ...orders]));
}

export function readReviews(productId: number): ReviewRecord[] {
  try { return JSON.parse(localStorage.getItem(`miraju-reviews-${productId}`) || "[]"); } catch { return []; }
}
export function writeReview(review: ReviewRecord) {
  const reviews = readReviews(review.productId);
  localStorage.setItem(`miraju-reviews-${review.productId}`, JSON.stringify([review, ...reviews]));
}
