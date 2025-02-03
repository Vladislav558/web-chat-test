import React, { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import { FaVk } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";


const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Заполните все обязательные поля!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Некорректный email!");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email, password, rememberMe });

      if (response.status === "success") {
        navigate("/chat");
      } else {
        setError(response.data?.message || "Ошибка авторизации!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сервера!");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVkAuth = () => {
    window.location.href = "http://localhost:5000/oauth2/authorization/vk";
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      noValidate
    >
      <TextField
        label="Почта"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "white",
            backgroundColor: "#252525",
            borderRadius: "8px",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary-color)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary-color)",
            },
          },
          "& .MuiInputLabel-root": { color: "#aaaaaa" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
          "& input": {
            "WebkitBoxShadow": "0 0 0px 1000px #252525 inset !important",
            "WebkitTextFillColor": "white !important",
            "caret-color": "white",
          },
        }}
      />
      <TextField
        label="Пароль"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="password"
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "white",
            backgroundColor: "#252525",
            borderRadius: "8px",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary-color)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary-color)",
            },
          },
          "& .MuiInputLabel-root": { color: "#aaaaaa" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
          "& input": {
            "WebkitBoxShadow": "0 0 0px 1000px #252525 inset !important",
            "WebkitTextFillColor": "white !important",
            "caret-color": "white",
          },
        }}
      />
      {error && <p style={{ color: "red", textAlign: "start", fontSize: "14px", fontWeight:"bold", padding: "0", margin: "0" }}>{error}</p>}
      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            sx={{
              color: "white",
              "&.Mui-checked": {
                color: "var(--primary-color)",
              },
            }}
          />
        }
        label="Запомнить устройство"
        sx={{ color: "white" }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", width: "100%", alignSelf: "center"}}>
        <Button type="submit" variant="contained" sx={{ backgroundColor: "var(--primary-color)", fontWeight: "bold", width: "100%"}}>
            {loading ? "Вход..." : "Войти"}
        </Button>
        <Button 
          onClick={handleVkAuth} 
          variant="contained" 
          sx={{ backgroundColor: "#4c75a3", fontWeight: "bold" }}
        >
          <FaVk />
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
