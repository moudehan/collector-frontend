import { SnackbarProvider } from "notistack";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateShopPage from "./pages/shop/ShopManagment";
import UserHome from "./pages/UserHome";
import ProtectedRoute from "./routes/ProtectedRoutes";

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
      <BrowserRouter>
        <Routes>
          <Route path="/Home" element={<Home />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserHome />
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
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}
