import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { VerifyFormProps } from "@/types/auth";

const VerifyForm: React.FC<VerifyFormProps> = ({ email, rememberMe }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!/^\d{6}$/.test(code)) {
      setError("Код должен содержать 6 цифр!");
      return;
    }
  
    try {
      const response = await authApi.verify({ email, code, rememberMe });
      if (response.status === "success") {
        navigate("/chat");
      } else {
        setError(response.data.message || "Неверный код подтверждения!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сервера!");
    }
  };
  
  return (
    <form 
      onSubmit={handleVerify} 
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      noValidate
    >
      <Typography 
        variant="body1" 
        sx={{
          color: "white",
          textAlign: "center",
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Введите код отправленый на <b>{email}</b>  
      </Typography>

      <TextField
        label="Код подтверждения"
        variant="outlined"
        fullWidth
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="off"
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "white",
            backgroundColor: "#252525",
            borderRadius: "8px",
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary-color)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary-color)" },
          },
          "& .MuiInputLabel-root": { color: "#aaaaaa" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
          "& input": {
            WebkitBoxShadow: "0 0 0px 1000px #252525 inset !important",
            WebkitTextFillColor: "white !important",
            caretColor: "white",
          },
        }}
      />
      {error && <p style={{ color: "red", textAlign: "start", fontSize: "14px", fontWeight:"bold", padding: "0", margin: "0" }}>{error}</p>}
      <Button type="submit" variant="contained" sx={{ backgroundColor: "var(--primary-color)", fontWeight: "bold" }}>
        Подтвердить
      </Button>
    </form>
  );
};

export default VerifyForm;
