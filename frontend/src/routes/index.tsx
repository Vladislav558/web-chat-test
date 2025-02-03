import React from "react";
import { Routes, Route } from "react-router-dom";
import Main from "@/layers/Main/Main";
import AuthPage from "@/pages/AuthPage/AuthPage";
import ChatPage from "@/pages/ChatPage/ChatPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Main />}>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
