import { createBrowserRouter, Navigate, Outlet, useParams } from "react-router-dom";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { TeamRoleProvider } from "@/contexts/TeamRoleContext";
import { Toaster } from "sonner";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AuthOnlyRoute from "@/components/shared/AuthOnlyRoute";
import GuestRoute from "@/components/shared/GuestRoute";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import BookingsPage from "@/features/bookings/pages/BookingsPage";
import AvailabilityPage from "@/features/availability/pages/AvailabilityPage";
import ProductsListPage from "@/features/products/pages/ProductsListPage";
import ProductDetailPage from "@/features/products/pages/ProductDetailPage";
import ProductBuilderPage from "@/features/products/pages/ProductBuilderPage";
import ReviewsPage from "@/features/reviews/pages/ReviewsPage";
import FinancePage from "@/features/finance/pages/FinancePage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import ChatPage from "@/features/chat/pages/ChatPage";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import CancellationRatePage from "@/features/cancellation/pages/CancellationRatePage";
import SpecialOffersListPage from "@/features/special-offers/pages/SpecialOffersListPage";
import SpecialOfferBuilderPage from "@/features/special-offers/pages/SpecialOfferBuilderPage";

import AuthCallback from "@/features/auth/pages/AuthCallback";
import LoginPage from "@/features/auth/pages/LoginPage";

import SupplierStatusPage from "@/features/supplier/pages/SupplierStatusPage";

import TeamInvitePage from "@/pages/TeamInvitePage";

import NotFoundPage from "@/pages/errors/NotFoundPage";
import ServerErrorPage from "@/pages/errors/ServerErrorPage";
import ForbiddenPage from "@/pages/errors/ForbiddenPage";
import NetworkErrorPage from "@/pages/errors/NetworkErrorPage";

const LEGACY_STEP_MAP = {
  type: { section: "basics", step: "categorization" },
  basics: { section: "basics", step: "language-and-title" },
  content: { section: "product-content", step: "meeting-and-pickup" },
  photos: { section: "basics", step: "photos" },
  pricing: { section: "schedules-and-pricing", step: "pricing-schedules" },
  schedule: { section: "schedules-and-pricing", step: "pricing-schedules" },
  booking: { section: "booking-and-tickets", step: "booking-process" },
  review: { section: "finish", step: "submit-for-review" },
};

function ProductBuilderRedirect() {
  const { id, step } = useParams();
  const mapping = LEGACY_STEP_MAP[step];
  const params = new URLSearchParams();
  if (mapping) {
    params.set("section", mapping.section);
    params.set("step", mapping.step);
  } else {
    params.set("section", "basics");
    params.set("step", "language-and-title");
  }
  const target = `/products/build/${id || "new"}?${params.toString()}`;
  return <Navigate to={target} replace />;
}

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <TeamRoleProvider>
        <Outlet />
      </TeamRoleProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', system-ui, sans-serif",
          },
        }}
      />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/auth/callback", element: <AuthCallback /> },
      {
        path: "/login",
        element: <GuestRoute><LoginPage /></GuestRoute>,
      },
      { path: "/supplier/status", element: <SupplierStatusPage /> },
      { path: "/error/404", element: <NotFoundPage /> },
      { path: "/error/500", element: <ServerErrorPage /> },
      { path: "/error/403", element: <ForbiddenPage /> },
      { path: "/error/network", element: <NetworkErrorPage /> },
      {
        element: <AuthOnlyRoute />,
        children: [
          { path: "/team/invite", element: <TeamInvitePage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "bookings", element: <BookingsPage /> },
              { path: "availability", element: <AvailabilityPage /> },
              { path: "products", element: <ProductsListPage /> },
              { path: "products/:id", element: <ProductDetailPage /> },
              { path: "products/build/:id/:step", element: <ProductBuilderRedirect /> },
              { path: "products/build/:id?", element: <ProductBuilderPage /> },
              { path: "reviews", element: <ReviewsPage /> },
              { path: "finance", element: <FinancePage /> },
              { path: "notifications", element: <NotificationsPage /> },
              { path: "settings", element: <SettingsPage /> },
              { path: "chat", element: <ChatPage /> },
              { path: "customers", element: <Navigate to="/chat" replace /> },
              { path: "analytics", element: <AnalyticsPage /> },
              { path: "cancellation-rate", element: <CancellationRatePage /> },
              { path: "special-offers", element: <SpecialOffersListPage /> },
              { path: "special-offers/build/:id?/:step?", element: <SpecialOfferBuilderPage /> },
              { path: "*", element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
