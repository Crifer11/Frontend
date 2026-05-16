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
import { API_URL } from "./Menu"

function Login({ onLoginExitoso, onLogout }) {
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
      const response = await fetch(`${API_URL}/login`, {
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
            `${API_URL}/obtener_nombre?id=${data.id}&rol=${data.rol}`
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

        // Notificar a App.jsx para conectar SSE si es vigilante
        onLoginExitoso(data.rol, data.id);

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
      const response = await fetch(`${API_URL}/generar_token`, {
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
        `${API_URL}/verificar_token/?id_usuario=${idRecuperar}`,
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
        `${API_URL}/cambiar_contrasena`,
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
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: "url(/Fondo.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative",
      overflow: "hidden",
    
      // Brillo azul pulsante sutil
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(
            ellipse at 50% 80%,
            rgba(0, 150, 255, 0.15),
            transparent 60%
          )
        `,
        animation: "glow 6s ease-in-out infinite",
        zIndex: 1,
      },
    
      // Línea de escaneo tipo HUD
      "&::after": {
        content: '""',
        position: "absolute",
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(0, 180, 255, 0.4), transparent)",
        animation: "scanLine 8s linear infinite",
        zIndex: 2,
      },
    
      "@keyframes glow": {
        "0%, 100%": { opacity: 0.3 },
        "50%": { opacity: 0.7 },
      },
    
      "@keyframes scanLine": {
        "0%": { top: "-2px" },
        "100%": { top: "100%" },
      },
    }}
    >
      {/* LOGO */}
      <Box
        component="img"
        src="../logo2.png"
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
