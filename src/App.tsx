import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AgentButton } from "./components/agent/AgentButton";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import UserProfile from "./components/UserProfile";
import Index from "./pages/Index";
import About from "./pages/About";
import CreateGift from "./pages/CreateGift";
import ClaimGift from "./pages/ClaimGift";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import MyGiftCards from "./pages/MyGiftCards";
import Marketplace from "./pages/Marketplace";
import CategoryCards from "./pages/CategoryCards";
import CardDetail from "./pages/CardDetail";
import CreateBackground from "./pages/CreateBackground";
import Debug from "./pages/Debug";
import ProfilePage from "./pages/ProfilePage";
import { User } from "lucide-react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Index />} />
                  <Route path="about" element={<About />} />
                  <Route path="create" element={<CreateGift />} />
                  <Route path="claim" element={<ClaimGift />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="my-gift-cards" element={<MyGiftCards />} />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route
                    path="marketplace/:categoryId"
                    element={<CategoryCards />}
                  />
                  <Route
                    path="marketplace/:categoryId/:cardId"
                    element={<CardDetail />}
                  />
                  <Route
                    path="create-background"
                    element={<CreateBackground />}
                  />
                  <Route path="debug" element={<Debug />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AgentButton />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
