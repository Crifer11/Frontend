import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  Drawer,
  Collapse,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useSnackbar } from "notistack";
import { API_URL } from "./Menu";

const Supervision = ({ sseRef }) => {
  const { enqueueSnackbar } = useSnackbar();
  const idVigilante = localStorage.getItem("id");

  // Imágenes recibidas por SSE (base64)
  const [imgRostro, setImgRostro] = useState(null);
  const [imgPlaca, setImgPlaca] = useState(null);

  const [resultado, setResultado] = useState("");
  const [status, setStatus] = useState("espera");
  const [parpadeo, setParpadeo] = useState(false);
  const [alarmaActiva, setAlarmaActiva] = useState(false);

  // Estados para comentario de reporte
  const [idReporte, setIdReporte] = useState(null);
  const [comentario, setComentario] = useState("");
  const [guardandoComentario, setGuardandoComentario] = useState(false);

  // Estados para el Drawer de incidentes
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");

  const nombre_v = localStorage.getItem("nombre");
  const caseta = localStorage.getItem("caseta");

  // --- SSE: escuchar eventos usando la conexión de App.jsx ---
  useEffect(() => {
    if (!sseRef?.current) return;

    sseRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.img_rostro) setImgRostro(data.img_rostro);
      if (data.img_placa) setImgPlaca(data.img_placa);

      setResultado(data.resultado);

      if (data.tipo === "autorizado") {
        setStatus("autorizado");
        setTimeout(() => {
          setStatus("espera");
          setImgRostro(null);
          setImgPlaca(null);
        }, 5000);
      } else {
        setStatus("alerta");
        setAlarmaActiva(true);
        if (data.id_reporte) {
          setIdReporte(data.id_reporte);
        }
      }
    };

    sseRef.current.onerror = () => {
      console.error("SSE: error de conexión, reintentando...");
    };

    // Al salir solo quitamos el listener, NO cerramos el SSE
    // porque sigue activo en App.jsx para otras páginas
    return () => {
      if (sseRef.current) {
        sseRef.current.onmessage = null;
        sseRef.current.onerror = null;
      }
    };
  }, [sseRef]);

  // Parpadeo al entrar en alerta
  useEffect(() => {
    if (status === "alerta") {
      setParpadeo(true);
      const timer = setTimeout(() => setParpadeo(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const apagarAlarma = () => {
    setStatus("espera");
    setParpadeo(false);
    setResultado("");
    setAlarmaActiva(false);
    setIdReporte(null);
    setComentario("");
    setImgRostro(null);
    setImgPlaca(null);
  };

  const agregarComentario = async () => {
    if (!idReporte) return;
    setGuardandoComentario(true);
    const formData = new FormData();
    formData.append("tiempo", idReporte);
    formData.append("comentario", comentario);
    try {
      const res = await fetch(`${API_URL}/supervision/agregar_comentario`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        enqueueSnackbar("Comentario agregado correctamente", { variant: "success" });
      } else {
        enqueueSnackbar(data.detail || "Error al guardar el comentario", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error de conexión con el servidor", { variant: "error" });
    } finally {
      setGuardandoComentario(false);
      setIdReporte(null);
      setComentario("");
    }
  };

  const cancelarComentario = () => {
    setIdReporte(null);
    setComentario("");
  };

  const registrarIncidente = async () => {
    if (!titulo || !contenido) {
      enqueueSnackbar("Todos los campos son obligatorios", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("contenido", contenido);
    formData.append("nombre_v", nombre_v);
    formData.append("caseta", caseta);

    try {
      const response = await fetch(`${API_URL}/registrar_incidente`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar("Incidente registrado correctamente", { variant: "success" });
        setTitulo("");
        setContenido("");
        setDrawerAbierto(false);
      } else {
        enqueueSnackbar(data.error || "Error al registrar el incidente", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Error de conexión con el servidor", { variant: "error" });
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "autorizado":
        return {
          text: "✅ Acceso Concedido",
          color: "#4caf50",
          bgColor: "#e8f5e9",
          icon: <CheckCircleIcon sx={{ fontSize: 40, color: "#4caf50" }} />,
        };
      case "alerta":
        return {
          text: "🚨 Alerta: Fallo de Reconocimiento",
          color: "#f44336",
          bgColor: "#ffebee",
          icon: <WarningIcon sx={{ fontSize: 40, color: "#f44336" }} />,
        };
      default:
        return {
          text: "En espera...",
          color: "#9e9e9e",
          bgColor: "#f5f5f5",
          icon: <HourglassEmptyIcon sx={{ fontSize: 40, color: "#9e9e9e" }} />,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: parpadeo ? "#ffcdd2" : "transparent",
        p: 4,
        transition: "background-color 0.3s ease",
        animation: parpadeo ? "parpadeo 0.5s infinite" : "none",
        "@keyframes parpadeo": {
          "0%, 100%": { bgcolor: "#ffcdd2" },
          "50%": { bgcolor: "#f44336" },
        },
      }}
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2", mb: 4 }}
      >
        🔒 Modo Supervisión
      </Typography>

      {/* IMÁGENES */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  align="center"
                  sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
                >
                  👤 Reconocimiento Facial
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    bgcolor: "#e3f2fd",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #1976d2",
                  }}
                >
                  {imgRostro ? (
                    <img
                      src={`data:image/jpeg;base64,${imgRostro}`}
                      alt="Rostro"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      Esperando imagen...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  align="center"
                  sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
                >
                  🚗 Reconocimiento de Placas
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    bgcolor: "#e3f2fd",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #1976d2",
                  }}
                >
                  {imgPlaca ? (
                    <img
                      src={`data:image/jpeg;base64,${imgPlaca}`}
                      alt="Placa"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      Esperando imagen...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* STATUS */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          bgcolor: statusConfig.bgColor,
          borderLeft: `6px solid ${statusConfig.color}`,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {statusConfig.icon}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              STATUS DE PROCESO
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: statusConfig.color }}>
              {statusConfig.text}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* CUADRO DE COMENTARIO */}
      <Collapse in={!!idReporte}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            border: "2px solid #f44336",
            borderRadius: 2,
            bgcolor: "#fff8f8",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
            💬 Agregar comentario al reporte
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Opcional — describe lo ocurrido para añadir información adicional al reporte generado.
          </Typography>
          <TextField
            label="Comentario"
            multiline
            rows={3}
            fullWidth
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            inputProps={{ maxLength: 200 }}
            placeholder="Ej: El conductor se negó a identificarse..."
            helperText={`${comentario.length}/200 caracteres`}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={agregarComentario}
              disabled={guardandoComentario || comentario.trim() === ""}
            >
              {guardandoComentario ? "Guardando..." : "Agregar"}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={cancelarComentario}
              disabled={guardandoComentario}
            >
              Cancelar
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* BOTÓN APAGAR ALARMA */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={apagarAlarma}
          disabled={!alarmaActiva}
          sx={{ px: 6, py: 2, fontSize: "1.1rem", fontWeight: "bold" }}
        >
          🔕 Apagar Alarma
        </Button>
      </Box>

      {/* BOTÓN INCIDENTE */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setDrawerAbierto(true)}
          sx={{
            px: 6, py: 2, fontSize: "1.1rem", fontWeight: "bold",
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
          }}
        >
          📝 Generar Reporte de Incidente
        </Button>
      </Box>

      {/* DRAWER INCIDENTE */}
      <Drawer anchor="right" open={drawerAbierto} onClose={() => setDrawerAbierto(false)}>
        <Box sx={{ width: 450, p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
            📋 Registrar Incidente
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">VIGILANTE</Typography>
              <Typography variant="body1">{nombre_v || "N/A"}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">CASETA</Typography>
              <Typography variant="body1">{caseta || "N/A"}</Typography>
            </Box>
            <TextField
              label="Asunto del incidente"
              variant="outlined"
              fullWidth
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Vehículo sospechoso"
            />
            <TextField
              label="Detalles del incidente"
              variant="outlined"
              fullWidth
              multiline
              rows={6}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe lo ocurrido..."
            />
            <Button variant="contained" onClick={registrarIncidente} fullWidth size="large" sx={{ mt: 2 }}>
              Registrar Incidente
            </Button>
            <Button variant="outlined" onClick={() => setDrawerAbierto(false)} fullWidth>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Supervision;
