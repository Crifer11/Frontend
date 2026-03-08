import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import SecurityIcon from "@mui/icons-material/Security";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const rol = localStorage.getItem("rol");

  const handleNavigation = (path) => {
    if (path === "/logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box>
      {/* Barra de navegación superior */}
      <AppBar position="sticky" sx={{ bgcolor: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => handleNavigation("/menu")}
            sx={{
              color: "white",
              bgcolor: isActive("/menu") ? "rgba(255,255,255,0.2)" : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Inicio
          </Button>

          <Button
            startIcon={<PersonIcon />}
            onClick={() => handleNavigation("/informacion")}
            sx={{
              color: "white",
              bgcolor: isActive("/informacion") ? "rgba(255,255,255,0.2)" : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Información
          </Button>

          {rol !== "Autorizado" && (
            <Button
              startIcon={<DescriptionIcon />}
              onClick={() => handleNavigation("/reportes")}
              sx={{
                color: "white",
                bgcolor: isActive("/reportes") ? "rgba(255,255,255,0.2)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Reportes
            </Button>
          )}

          {rol === "Vigilante" && (
            <Button
              startIcon={<SecurityIcon />}
              onClick={() => handleNavigation("/supervision")}
              sx={{
                color: "white",
                bgcolor: isActive("/supervision") ? "rgba(255,255,255,0.2)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Supervisión
            </Button>
          )}

          {rol === "Administrador" && (
            <Button
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => handleNavigation("/administracion")}
              sx={{
                color: "white",
                bgcolor: isActive("/administracion") ? "rgba(255,255,255,0.2)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Admin
            </Button>
          )}

          <Button
            startIcon={<LogoutIcon />}
            onClick={() => handleNavigation("/logout")}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenido de las páginas */}
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url(/fondo2.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: .2, // Muy tenue para no molestar
            zIndex: -1,
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout
