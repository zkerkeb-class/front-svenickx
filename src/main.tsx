import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import Activate from "./pages/activate.tsx";
import Chat from "./pages/chat.tsx";
import Index from "./pages/index.tsx";
import Login from "./pages/login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate/:token" element={<Activate />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
