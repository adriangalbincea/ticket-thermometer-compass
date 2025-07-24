import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { RoleBasedAccess } from "@/components/RoleBasedAccess";
import Feedback from "./pages/Feedback";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Config from "./pages/Config";
import ApiTestGuide from "./pages/ApiTestGuide";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/admin" replace /> : <Auth />} />
      <Route path="/auth" element={user ? <Navigate to="/admin" replace /> : <Auth />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/feedback/:token" element={<Feedback />} />
      <Route path="/config" element={
        <ProtectedRoute>
          <RoleBasedAccess allowedRoles={['admin']} fallback={<Navigate to="/admin" replace />}>
            <Config />
          </RoleBasedAccess>
        </ProtectedRoute>
      } />
      <Route path="/api-test-guide" element={
        <ProtectedRoute>
          <RoleBasedAccess allowedRoles={['admin']} fallback={<Navigate to="/admin" replace />}>
            <ApiTestGuide />
          </RoleBasedAccess>
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
