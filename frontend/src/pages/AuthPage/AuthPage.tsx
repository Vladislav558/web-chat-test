import React from "react";
import AuthCard from "@/components/AuthCard/AuthCard";
import styles from "./AuthPage.module.scss";

const AuthPage: React.FC = () => {
  return (
    <div className={styles.authPage}>
      <AuthCard />
    </div>
  );
};

export default AuthPage;
