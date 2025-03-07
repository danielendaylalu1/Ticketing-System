import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from "./pages/auth/AuthLayout.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import Tickets from "./pages/tickets/Tickets.tsx";
import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route>
        <Route path="/" element={<App />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
