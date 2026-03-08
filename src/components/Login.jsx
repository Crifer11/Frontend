import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { useSnackbar } from "notistack";

function Login() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [idRecuperar, setIdRecuperar] = useState("");
  const [tokenRecuperar, setTokenRecuperar] = useState("");
  const [tokenValidado, setTokenValidado] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  const [errorLogin, setErrorLogin] = useState(false);

  // ================= LOGIN =================
  const handleLogin = async () => {
    setErrorLogin(false);

    const formData = new FormData();
    formData.append("id", usuario);
    formData.append("contrasena", contrasena);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar("Sesión iniciada correctamente", { variant: "success" });

        localStorage.setItem("rol", data.rol);
        localStorage.setItem("id", data.id);

        try {
          const res = await fetch(
            `http://127.0.0.1:8000/obtener_nombre?id=${data.id}&rol=${data.rol}`
          );
          const nombreData = await res.json();

          if (nombreData.nombre) {
            localStorage.setItem("nombre", nombreData.nombre);
          }
          if (nombreData.caseta) {
            localStorage.setItem("caseta", nombreData.caseta);
          }
        } catch (e) {
          console.error("Error al obtener nombre", e);
        }

        navigate("/menu");
      } else {
        setErrorLogin(true);
        enqueueSnackbar(data.detail || "Credenciales incorrectas", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error de conexión con el servidor", {
        variant: "error",
      });
    }
  };

  // ================= RECUPERAR TOKEN =================
  const pedirToken = async () => {
    const formData = new FormData();
    formData.append("id", idRecuperar);

    try {
      const response = await fetch("http://127.0.0.1:8000/generar_token", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar("Token generado correctamente", { variant: "info" });
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error al generar token", { variant: "error" });
    }
  };

  // ================= VALIDAR TOKEN =================
  const validarToken = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/verificar_token/?id_usuario=${idRecuperar}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenRecuperar }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar("Token validado", { variant: "success" });
        setTokenValidado(true);
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error al validar token", { variant: "error" });
    }
  };

  // ================= CAMBIAR CONTRASEÑA =================
  const cambiarContrasena = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/cambiar_contrasena",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: idRecuperar,
            nueva_contrasena: nuevaContrasena,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar("Contraseña actualizada correctamente", {
          variant: "success",
        });

        setModo("login");
        setTokenValidado(false);
        setNuevaContrasena("");
        setTokenRecuperar("");
        setIdRecuperar("");
      } else {
        enqueueSnackbar(data.detail || "No se pudo cambiar la contraseña", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error de conexión con el servidor", {
        variant: "error",
      });
      console.error(error);
    }
  };

  // ================= UI =================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url(/Fondo.JPEG)", // nueva placa
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",

        /* 🔹 Pulso eléctrico suave */
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(
              135deg,
              rgba(0, 255, 170, 0.12),
              rgba(0, 150, 255, 0.10),
              rgba(0, 255, 170, 0.12)
            )
          `,
          animation: "electricPulse 10s ease-in-out infinite",
          zIndex: 1,
        },

        /* 🔹 Flujo de energía (muy sutil) */
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(
              120deg,
              transparent 40%,
              rgba(0, 255, 200, 0.08),
              transparent 60%
            )
          `,
          animation: "energyFlow 14s linear infinite",
          zIndex: 2,
        },

        "@keyframes electricPulse": {
          "0%": { opacity: 0.35 },
          "50%": { opacity: 0.7 },
          "100%": { opacity: 0.35 },
        },

        "@keyframes energyFlow": {
          "0%": { transform: "translateX(-30%) translateY(-30%)" },
          "100%": { transform: "translateX(30%) translateY(30%)" },
        },
      }}
    >
      {/* 🔹 LOGO */}
      <Box
        component="img"
        src="/logo2.png"
        alt="SafeGate Logo"
        sx={{
          width: 250,
          height: "auto",
          mb: 3,
          position: "relative",
          zIndex: 3,
          filter: "drop-shadow(0 0 20px rgba(0,255,180,0.35))",
          animation: "logoFloat 3s ease-in-out infinite",
          "@keyframes logoFloat": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-10px)" },
          },
        }}
      />

      {/* FORMULARIO */}
      <Card 
        sx={{ 
          width: 380, 
          position: "relative", 
          zIndex: 3,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <CardContent>
          {modo === "login" && (
            <Stack spacing={2}>
              <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }}>
                Acceso al sistema
              </Typography>

              <TextField
                label="ID de usuario"
                variant="outlined"
                value={usuario}
                error={errorLogin}
                onChange={(e) => setUsuario(e.target.value)}
              />

              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                value={contrasena}
                error={errorLogin}
                onChange={(e) => setContrasena(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              <Button variant="contained" onClick={handleLogin}>
                Iniciar sesión
              </Button>

              <Button variant="text" onClick={() => setModo("recuperar")}>
                ¿Olvidaste tu contraseña?
              </Button>
            </Stack>
          )}

          {modo === "recuperar" && !tokenValidado && (
            <Stack spacing={2}>
              <Typography variant="h6">Recuperar contraseña</Typography>

              <TextField
                label="ID de usuario"
                variant="outlined"
                value={idRecuperar}
                onChange={(e) => setIdRecuperar(e.target.value)}
              />

              <Button variant="contained" onClick={pedirToken}>
                Pedir token
              </Button>

              <TextField
                label="Token recibido"
                variant="outlined"
                value={tokenRecuperar}
                onChange={(e) => setTokenRecuperar(e.target.value)}
              />

              <Button variant="contained" onClick={validarToken}>
                Validar token
              </Button>

              <Button variant="text" onClick={() => setModo("login")}>
                Volver
              </Button>
            </Stack>
          )}

          {modo === "recuperar" && tokenValidado && (
            <Stack spacing={2}>
              <Typography variant="h6">Nueva contraseña</Typography>

              <TextField
                label="Nueva contraseña"
                type="password"
                variant="outlined"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />

              <Button variant="contained" onClick={cambiarContrasena}>
                Confirmar
              </Button>

              <Button variant="text" onClick={() => setModo("login")}>
                Cancelar
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;