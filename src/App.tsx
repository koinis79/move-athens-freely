import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Equipment from "./pages/Equipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import EquipmentCategory from "./pages/EquipmentCategory";
import HowItWorks from "./pages/HowItWorks";
import AccessibleAthens from "./pages/AccessibleAthens";
import AccessibleAthensGuide from "./pages/AccessibleAthensGuide";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import BookingConfirmation from "./pages/BookingConfirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import BookingsNew from "./pages/admin/BookingsNew";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public site */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="/equipment/:categorySlug" element={<EquipmentCategory />} />
                <Route path="/equipment/:categorySlug/:slug" element={<EquipmentDetail />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/accessible-athens" element={<AccessibleAthens />} />
                <Route path="/accessible-athens/:slug" element={<AccessibleAthensGuide />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
              </Route>

              {/* Admin panel — separate layout, no header/footer */}
              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/bookings-new" element={<BookingsNew />} />
                <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                <Route path="/admin/calendar" element={<AdminCalendarPage />} />
                <Route path="/admin/customers" element={<AdminCustomersPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
