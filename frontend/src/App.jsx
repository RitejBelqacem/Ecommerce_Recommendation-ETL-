import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/home" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />

        <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<Products />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;