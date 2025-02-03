import React, { useState } from "react";
import styles from "./AuthCard.module.scss";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import VerifyForm from "./VerifyForm";
import { Tabs, Tab } from "@mui/material";

const AuthCard: React.FC = () => {
  const [tab, setTab] = useState<"login" | "register" | "verify">("login");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className={styles.authCard}>
    {tab !== "verify" && (
      <Tabs
        value={tab}
        onChange={(_, newValue: "login" | "register") => setTab(newValue)}
        centered
        className={styles.authTabs}
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: "var(--primary-color)",
          },
          "& .MuiTab-root": {
            color: "white",
            fontWeight: "bold",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          },
          "& .Mui-selected": {
            color: "var(--primary-color) !important",
          },
        }}
      >
        <Tab label="Вход" value="login"  />
        <Tab label="Регистрация" value="register" />
      </Tabs>
      )}

      <div className={styles.formContainer}>
        {tab === "login" && <LoginForm />}
        {tab === "register" && <RegisterForm setTab={setTab} setEmail={setEmail} setRememberMe={setRememberMe} />}
        {tab === "verify" && <VerifyForm email={email} rememberMe={rememberMe} />}
      </div>
    </div>
  );
};

export default AuthCard;
