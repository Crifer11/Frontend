import { Box, Typography, Avatar, Button, Paper, Chip, Card, CardContent, Stack, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export const API_URL = "https://backend-proyecto-production-14b7.up.railway.app"

// ── Fila de stats: reparte el espacio en partes iguales ─────────────
function StatsRow({ children }) {
  return (
    <Box sx={{ display: "flex", gap: 2.5, width: "100%", flexWrap: "wrap" }}>
      {children}
    </Box>
  );
}

// ── Tarjeta de estadística — ocupa 1/N del ancho disponible ─────────
function StatCard({ label, value, icon, color = "#1976d2", flex = 1, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Card elevation={2} sx={{
      flex, minWidth: 160,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s",
      borderRadius: 3,
      border: `1px solid ${color}30`,
      "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
      overflow: "hidden",
    }}>
      <Box sx={{ height: 5, bgcolor: color }} />
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box sx={{
            width: 64, height: 64, borderRadius: 2.5, flexShrink: 0,
            bgcolor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Box sx={{ "& svg": { fontSize: "2rem" } }}>{icon}</Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" fontWeight="bold" color={color} lineHeight={1}>
              {value ?? "—"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Fila de info ────────────────────────────────────────────────────
function InfoRow({ label, value, icon }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      py: 1.5, borderBottom: "1px solid #f5f5f5",
      "&:last-child": { borderBottom: "none" },
    }}>
      {icon && <Box sx={{ color: "#1976d2", display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</Box>}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold"
          sx={{ textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ textAlign: "right" }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Card con título ─────────────────────────────────────────────────
function SectionCard({ title, icon, children, color = "#1976d2", flex = 1, delay = 0, minWidth = 260 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Card elevation={2} sx={{
      flex, minWidth,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
      borderRadius: 3,
      border: `1px solid ${color}25`,
    }}>
      <Box sx={{ height: 5, bgcolor: color }} />
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <Box sx={{ color, "& svg": { fontSize: "1.3rem" } }}>{icon}</Box>
          <Typography variant="h6" fontWeight="bold" color={color}>{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

// ── Token de edición ────────────────────────────────────────────────
function TokenSection({ id, flex = 1 }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const generarToken = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id", id);
    try {
      const res = await fetch(`${API_URL}/generar_token`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        enqueueSnackbar("Token generado correctamente", { variant: "success" });
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error al conectar con el servidor", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={2} sx={{ flex, minWidth: 220, borderRadius: 3, border: "1px solid #a5d6a740", overflow: "hidden" }}>
      <Box sx={{ height: 5, bgcolor: "#43a047" }} />
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: "1.3rem" }}>🔐</Typography>
          <Typography variant="h6" fontWeight="bold" color="#43a047">Token de edición</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Genera un token temporal para autorizar cambios en tu perfil.
        </Typography>
        <Button variant="contained" onClick={generarToken} disabled={loading}
          sx={{ bgcolor: "#43a047", "&:hover": { bgcolor: "#388e3c" }, borderRadius: 2, px: 3 }}>
          {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Generar token"}
        </Button>
        {token && (
          <Paper sx={{ p: 2, mt: 2.5, bgcolor: "#e8f5e9", borderRadius: 2, border: "1px solid #a5d6a7" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">TOKEN GENERADO</Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all", mt: 0.5, fontFamily: "monospace", color: "#2e7d32" }}>
              {token}
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}

// ── Header de perfil ────────────────────────────────────────────────
function ProfileHeader({ nombre, rol, visible }) {
  const ROLE_CFG = {
    Residente:     { color: "#1976d2", bg: "#e3f2fd", icon: "🏠" },
    Autorizado:    { color: "#7b1fa2", bg: "#f3e5f5", icon: "🔑" },
    Vigilante:     { color: "#e65100", bg: "#fff3e0", icon: "🛡️" },
    Administrador: { color: "#2e7d32", bg: "#e8f5e9", icon: "⚙️" },
  };
  const cfg = ROLE_CFG[rol] || ROLE_CFG["Residente"];

  return (
    <Card elevation={3} sx={{
      mb: 3, borderRadius: 3, overflow: "hidden", width: "100%",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <Box sx={{ height: 8, bgcolor: cfg.color }} />
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar sx={{ width: 80, height: 80, bgcolor: cfg.color, fontSize: "2.2rem", flexShrink: 0 }}>
            {nombre?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary" lineHeight={1.2}>
              {nombre}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip label={`${cfg.icon}  ${rol}`}
                sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.85rem", height: 28 }} />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARDS — todos usan flex en lugar de Grid
// ══════════════════════════════════════════════════════════════════

function DashResidente({ id }) {
  const [reportes, setReportes] = useState(null);
  const [autos, setAutos] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/menu/residente/reportes/${id}`).then(r => r.json()).then(setReportes).catch(console.error);
    fetch(`${API_URL}/menu/residente/autos/${id}`).then(r => r.json()).then(setAutos).catch(console.error);
  }, [id]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      <StatsRow>
        <StatCard label="Reportes totales" value={reportes?.total_reportes} icon={<AssignmentIcon sx={{ color: "#1976d2" }} />} color="#1976d2" delay={100} />
        <StatCard label="Vehículos registrados" value={autos?.autos} icon={<DirectionsCarIcon sx={{ color: "#0288d1" }} />} color="#0288d1" delay={200} />
        <StatCard label="Personas autorizadas" value={autos?.autorizados} icon={<GroupIcon sx={{ color: "#7b1fa2" }} />} color="#7b1fa2" delay={300} />
      </StatsRow>
      <Box sx={{ display: "flex", gap: 2.5, width: "100%", flexWrap: "wrap" }}>
        <SectionCard title="Último reporte" icon={<AssignmentIcon />} color="#1976d2" delay={400} flex={2} minWidth={260}>
          <InfoRow label="Fecha y hora" value={reportes?.ultimo_reporte ? new Date(reportes.ultimo_reporte).toLocaleString() : null} icon={<AccessTimeIcon fontSize="small" />} />
        </SectionCard>
        <TokenSection id={id} flex={1} />
      </Box>
    </Box>
  );
}

function DashAutorizado({ id }) {
  const [autos, setAutos] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/menu/autorizado/autos/${id}`).then(r => r.json()).then(setAutos).catch(console.error);
  }, [id]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      <StatsRow>
        <StatCard label="Vehículos autorizados" value={autos?.length} icon={<DirectionsCarIcon sx={{ color: "#7b1fa2" }} />} color="#7b1fa2" delay={100} />
      </StatsRow>
      <Box sx={{ display: "flex", gap: 2.5, width: "100%", flexWrap: "wrap" }}>
        <SectionCard title="Vehículos con acceso" icon={<DirectionsCarIcon />} color="#7b1fa2" delay={200} flex={2} minWidth={260}>
          {autos?.length ? autos.map((a) => (
            <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid #f5f5f5", "&:last-child": { borderBottom: "none" } }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DirectionsCarIcon sx={{ color: "#7b1fa2" }} />
                <Typography variant="body1" fontWeight={600}>{a.placa}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">ID {a.id}</Typography>
            </Box>
          )) : <Typography variant="body2" color="text.secondary">Sin vehículos registrados</Typography>}
        </SectionCard>
        <TokenSection id={id} flex={1} />
      </Box>
    </Box>
  );
}

function DashVigilante() {
  const [resumen, setResumen] = useState(null);
  const [ultimoReporte, setUltimoReporte] = useState(null);
  const [casetas, setCasetas] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/menu/reportes/resumen`).then(r => r.json()).then(setResumen).catch(console.error);
    fetch(`${API_URL}/menu/admin/ultimo-reporte`).then(r => r.json()).then(setUltimoReporte).catch(console.error);
    fetch(`${API_URL}/menu/casetas`).then(r => r.json()).then(setCasetas).catch(console.error);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      <StatsRow>
        <StatCard label="Reportes hoy" value={resumen?.hoy} icon={<TodayIcon sx={{ color: "#e65100" }} />} color="#e65100" delay={100} />
        <StatCard label="Esta semana" value={resumen?.semana} icon={<DateRangeIcon sx={{ color: "#f57c00" }} />} color="#f57c00" delay={200} />
        <StatCard label="Este mes" value={resumen?.mes} icon={<CalendarMonthIcon sx={{ color: "#ff9800" }} />} color="#ff9800" delay={300} />
      </StatsRow>
      <Box sx={{ display: "flex", gap: 2.5, width: "100%", flexWrap: "wrap" }}>
        <SectionCard title="Último evento registrado" icon={<WarningAmberIcon />} color="#e65100" delay={400} flex={3} minWidth={280}>
          <InfoRow label="Motivo" value={ultimoReporte?.motivo} icon={<AssignmentIcon fontSize="small" />} />
          <InfoRow label="Vigilante" value={ultimoReporte?.vigilante} icon={<SecurityIcon fontSize="small" />} />
          <InfoRow label="Caseta" value={ultimoReporte?.caseta} icon={<HomeIcon fontSize="small" />} />
          <InfoRow label="Fecha y hora" value={ultimoReporte?.tiempo ? new Date(ultimoReporte.tiempo).toLocaleString() : null} icon={<AccessTimeIcon fontSize="small" />} />
        </SectionCard>
        <SectionCard title="Casetas activas" icon={<HomeIcon />} color="#e65100" delay={500} flex={2} minWidth={220}>
          {casetas?.length ? casetas.map((c) => (
            <Box key={c.id} sx={{ py: 1.5, borderBottom: "1px solid #f5f5f5", "&:last-child": { borderBottom: "none" } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label={`Caseta ${c.id}`} size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700 }} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">{c.telefono}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">{c.ubicacion}</Typography>
              </Stack>
            </Box>
          )) : <Typography variant="body2" color="text.secondary">Sin casetas registradas</Typography>}
        </SectionCard>
      </Box>
    </Box>
  );
}

function DashAdmin() {
  const [resumen, setResumen] = useState(null);
  const [ultimoReporte, setUltimoReporte] = useState(null);
  const [casetas, setCasetas] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/menu/reportes/resumen`).then(r => r.json()).then(setResumen).catch(console.error);
    fetch(`${API_URL}/menu/admin/ultimo-reporte`).then(r => r.json()).then(setUltimoReporte).catch(console.error);
    fetch(`${API_URL}/menu/casetas`).then(r => r.json()).then(setCasetas).catch(console.error);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      <StatsRow>
        <StatCard label="Reportes hoy" value={resumen?.hoy} icon={<TodayIcon sx={{ color: "#2e7d32" }} />} color="#2e7d32" delay={100} />
        <StatCard label="Esta semana" value={resumen?.semana} icon={<DateRangeIcon sx={{ color: "#388e3c" }} />} color="#388e3c" delay={200} />
        <StatCard label="Este mes" value={resumen?.mes} icon={<CalendarMonthIcon sx={{ color: "#43a047" }} />} color="#43a047" delay={300} />
        <StatCard label="Casetas" value={casetas?.length} icon={<HomeIcon sx={{ color: "#1976d2" }} />} color="#1976d2" delay={400} />
      </StatsRow>
      <Box sx={{ display: "flex", gap: 2.5, width: "100%", flexWrap: "wrap" }}>
        <SectionCard title="Último reporte del sistema" icon={<WarningAmberIcon />} color="#2e7d32" delay={500} flex={3} minWidth={280}>
          <InfoRow label="Motivo" value={ultimoReporte?.motivo} icon={<AssignmentIcon fontSize="small" />} />
          <InfoRow label="Vigilante" value={ultimoReporte?.vigilante} icon={<SecurityIcon fontSize="small" />} />
          <InfoRow label="Caseta" value={ultimoReporte?.caseta} icon={<HomeIcon fontSize="small" />} />
          <InfoRow label="Fecha y hora" value={ultimoReporte?.tiempo ? new Date(ultimoReporte.tiempo).toLocaleString() : null} icon={<AccessTimeIcon fontSize="small" />} />
        </SectionCard>
        <SectionCard title="Casetas registradas" icon={<HomeIcon />} color="#1976d2" delay={600} flex={2} minWidth={220}>
          {casetas?.length ? casetas.map((c) => (
            <Box key={c.id} sx={{ py: 1.5, borderBottom: "1px solid #f5f5f5", "&:last-child": { borderBottom: "none" } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label={`Caseta ${c.id}`} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 700 }} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">{c.telefono}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">{c.ubicacion}</Typography>
              </Stack>
            </Box>
          )) : <Typography variant="body2" color="text.secondary">Sin casetas registradas</Typography>}
        </SectionCard>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════
function Menu() {
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");
  const id = localStorage.getItem("id");
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const renderDashboard = () => {
    switch (rol) {
      case "Residente":     return <DashResidente id={id} />;
      case "Autorizado":    return <DashAutorizado id={id} />;
      case "Vigilante":     return <DashVigilante />;
      case "Administrador": return <DashAdmin />;
      default:              return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "transparent", boxSizing: "border-box", width: "100%" }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
        🏠 Bienvenido, {nombre}
      </Typography>

      <ProfileHeader nombre={nombre} rol={rol} visible={headerVisible} />

      {renderDashboard()}

      <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 5 }}>
        Usa la barra de navegación para moverte entre secciones
      </Typography>
    </Box>
  );
}

export default Menu;
