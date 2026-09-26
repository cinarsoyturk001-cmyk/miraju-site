import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const CartPage = lazy(() => import("./pages/CartPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const QuotePage = lazy(() => import("./pages/QuotePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

function RouteFallback() {
  return <div className="grid min-h-[40vh] place-items-center bg-[#f7f8f6] text-sm font-semibold text-[#607068]">Sayfa yükleniyor…</div>;
}

function IntroGate() {
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const openDelay = reducedMotion ? 40 : mobile ? 320 : 560;
    const closeDelay = reducedMotion ? 120 : mobile ? 920 : 1450;
    document.body.classList.add("intro-active");
    const openTimer = window.setTimeout(() => setOpening(true), openDelay);
    const closeTimer = window.setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("intro-active");
    }, closeDelay);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      document.body.classList.remove("intro-active");
    };
  }, []);

  if (!visible) return null;
  return <div className={`intro-gate${opening ? " is-opening" : ""}`} aria-hidden="true">
    <div className="intro-gate__panel intro-gate__panel--left" />
    <div className="intro-gate__panel intro-gate__panel--right" />
    <div className="intro-gate__seam" />
    <div className="intro-gate__brand"><span>MIRAJU</span><b>.</b><small>PROFESSIONEL</small></div>
  </div>;
}

function Router() {
  return <Suspense fallback={<RouteFallback />}><Switch>
    <Route path="/" component={Home} />
    <Route path="/category/:slug" component={CategoryPage} />
    <Route path="/search" component={SearchPage} />
    <Route path="/cart" component={CartPage} />
    <Route path="/account" component={AccountPage} />
    <Route path="/product/:id" component={ProductPage} />
    <Route path="/info/:slug" component={InfoPage} />
    <Route path="/admin" component={AdminPage} />
    <Route path="/payment" component={PaymentPage} />
    <Route path="/quote" component={QuotePage} />
    <Route path="/shop" component={CategoryPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></Suspense>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><IntroGate /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
