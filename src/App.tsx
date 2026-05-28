import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Contact from "./pages/Contact.tsx";
import Shipping from "./pages/Shipping.tsx";
import Returns from "./pages/Returns.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useCartSync } from "./hooks/useCartSync";
import NewsletterPopup from "./components/NewsletterPopup";
import DiscountBanner from "./components/DiscountBanner";
import CookieConsent from "./components/CookieConsent";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useCartSync();
  const location = useLocation();
  const showPopup = !location.pathname.startsWith("/admin-dashboard");

  useEffect(() => {
    if (typeof window.fbq === "function" && window.__fbqInitDone) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return (
    <>
      <DiscountBanner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product/:handle" element={<ProductDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showPopup && <NewsletterPopup />}
      <CookieConsent />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
