import { SnackbarProvider } from "notistack";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexte/AuthProvider";
import ArticleAddPage from "./pages/article/ArticleAddPage";
import ArticleDetailPage from "./pages/article/ArticleDetailPage";
import ArticleDetailPageBuyer from "./pages/article/ArticleDetailPageBuyer";
import ConversationPage from "./pages/conversation/ConversationPage";
import Home from "./pages/Home";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ShopDetailPage from "./pages/shop/ShopDetailPage";
import ShopDetailPageBuyer from "./pages/shop/ShopDetailPageBuyer";
import CreateShopPage from "./pages/shop/ShopManagment";
import FavoritesPage from "./pages/user/Favorites";
import ProfilePage from "./pages/user/ProfilePage";
import PurchaseHistory from "./pages/user/PurchaseHistory";
import SalesHistory from "./pages/user/SalesHistory";
import UserHome from "./pages/UserHome";
import ProtectedRoute from "./routes/ProtectedRoutes";
export default function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/Home"
              element={
                <ProtectedRoute>
                  <UserHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ShopManagement"
              element={
                <ProtectedRoute>
                  <CreateShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:id"
              element={
                <ProtectedRoute>
                  <ShopDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/detail/:id"
              element={
                <ProtectedRoute>
                  <ShopDetailPageBuyer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/article/:id"
              element={
                <ProtectedRoute>
                  <ArticleDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/article/detail/:id"
              element={
                <ProtectedRoute>
                  <ArticleDetailPageBuyer />
                </ProtectedRoute>
              }
            />
            <Route
              path="shop/:shopId/article/add"
              element={
                <ProtectedRoute>
                  <ArticleAddPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="purchase-history"
              element={
                <ProtectedRoute>
                  <PurchaseHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales-history"
              element={
                <ProtectedRoute>
                  <SalesHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations"
              element={
                <ProtectedRoute>
                  <ConversationPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </SnackbarProvider>
  );
}
