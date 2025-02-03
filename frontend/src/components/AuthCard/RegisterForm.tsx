import React, { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import { FaVk } from "react-icons/fa";
import { authApi } from "@/api/authApi";
import { RegisterFormProps } from "@/types/auth";

const RegisterForm: React.FC<RegisterFormProps> = ({ setTab, setEmail, setRememberMe }) => {
    const [email, setLocalEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setLocalRememberMe] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
      
        if (!email.trim() || !firstName.trim() || !password.trim() || !confirmPassword.trim()) {
          setError("Заполните все обязательные поля!");
          return;
        }
      
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError("Некорректный email!");
          return;
        }
      
        if (password !== confirmPassword) {
          setError("Пароли не совпадают!");
          return;
        }
      
        setLoading(true);

        try {
          const response = await authApi.register({ email, firstName, lastName, password });
          if (response.status === "success") { 
            setEmail(email);
            setRememberMe(rememberMe);
            setTab("verify");
          } else {
            setError(response.data.message || "Ошибка регистрации!");
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
        onChange={(e) => setLocalEmail(e.target.value)}
        autoComplete="off"
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
        label="Имя пользователя"
        variant="outlined"
        fullWidth
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        autoComplete="off"
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
        label="Фамилия (необязательно)"
        variant="outlined"
        fullWidth
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        autoComplete="new-password"
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
        autoComplete="new-password"
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
        label="Подтвердите пароль"
        type="password"
        variant="outlined"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
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
            onChange={(e) => setLocalRememberMe(e.target.checked)}
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
            {loading ? "Регистрируемся..." : "Регистрация"}
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

export default RegisterForm;
