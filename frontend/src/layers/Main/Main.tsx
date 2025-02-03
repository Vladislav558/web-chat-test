// src/layers/Main/Main.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { MainProps } from "@/types/ui";

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <Layout>
      {children}
      <Outlet />
    </Layout>
  );
};

export default Main;
