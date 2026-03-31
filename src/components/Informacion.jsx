import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Chip,
  Stack,
  Button,
  TextField,
  Paper,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useSnackbar } from "notistack";
import { API_URL } from "./Menu"

function Informacion() {
  const { enqueueSnackbar } = useSnackbar();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  const id = localStorage.getItem("id");
  const rol = localStorage.getItem("rol");
  const [tokenGenerado, setTokenGenerado] = useState(null);

  const [idAuto, setIdAuto] = useState("");
  const [idPersona, setIdPersona] = useState("");

  useEffect(() => {
    const obtenerInformacion = async () => {
      try {
        const response = await fetch(`${API_URL}/informacion?id=${id}&rol=${rol}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setInfo(data);
        }
      } catch (error) {
        setError("❌ Error al obtener la información.");
        console.error(error);
      }
    };

    obtenerInformacion();
  }, [id, rol]);

  const autorizarAuto = async () => {
    const autoPropio = info?.autos?.some((auto) => auto.id == idAuto);
    if (!autoPropio) {
      enqueueSnackbar("Este auto no te pertenece. Solo puedes autorizar autos que sean tuyos.", {
        variant: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("id_auto", idAuto);
    formData.append("id_residente", idPersona);

    try {
      const res = await fetch(`${API_URL}/autorizar_auto`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        enqueueSnackbar(data.mensaje, { variant: "success" });
        window.location.reload();
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Error de conexión", { variant: "error" });
    }
  };

  const desautorizarAuto = async () => {
    const idPropio = parseInt(localStorage.getItem("id"));

    const autoPropio = info?.autos?.some((auto) => auto.id == idAuto);
    if (!autoPropio) {
      enqueueSnackbar("Solo puedes desautorizar autos que te pertenecen.", { variant: "error" });
      return;
    }

    if (parseInt(idPersona) === idPropio) {
      enqueueSnackbar("No puedes quitarte el permiso a ti mismo.", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("id_auto", idAuto);
    formData.append("id_residente", idPersona);

    try {
      const res = await fetch(`${API_URL}/desautorizar_auto`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        enqueueSnackbar(data.mensaje, { variant: "success" });
        window.location.reload();
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Error de conexión", { variant: "error" });
    }
  };

  const generarToken = async () => {
    const formData = new FormData();
    formData.append("id", info.id);

    try {
      const response = await fetch(`${API_URL}/generar_token`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setTokenGenerado(data.token);
        enqueueSnackbar("Token generado correctamente", { variant: "success" });
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch (error) {
      console.error("Error al generar token:", error);
      enqueueSnackbar("Error al conectar con el servidor", { variant: "error" });
    }
  };

  if (error) return <Box sx={{ p: 4 }}><Typography color="error">{error}</Typography></Box>;
  if (!info) return <Box sx={{ p: 4 }}><Typography>Cargando información...</Typography></Box>;

  // ── Busca la caseta de un vigilante dado su id_caseta ──
  const getNombreCaseta = (id_caseta) => {
    if (!id_caseta || !info.casetas) return null;
    return info.casetas.find((c) => c.id === id_caseta) || null;
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "transparent" }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 4 }}>
        👤 Información Personal
      </Typography>

      {/* INFORMACIÓN BÁSICA */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            {info.foto ? (
              <Avatar
                src={`${API_URL}/static/perfiles/${info.foto}?t=${Date.now()}`}
                sx={{ width: 120, height: 120 }}
              />
            ) : (
              <Avatar sx={{ width: 120, height: 120, bgcolor: "#1976d2" }}>
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
            )}

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {info.nombre}
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography variant="body1">{info.id}</Typography>
                </Box>
                {info.celular && (
                  <Box sx={{ p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">CELULAR</Typography>
                    <Typography variant="body1">{info.celular}</Typography>
                  </Box>
                )}
                {info.domicilio && (
                  <Box sx={{ p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">DOMICILIO</Typography>
                    <Typography variant="body1">{info.domicilio}</Typography>
                  </Box>
                )}
                {rol === "Vigilante" && info.caseta && (
                  <Box sx={{ p: 1, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">CASETA</Typography>
                    <Typography variant="body1">
                      ID: {info.caseta.id} | Tel: {info.caseta.telefono} | {info.caseta.ubicacion}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>

          {(rol === "Residente" || rol === "Autorizado") && (
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={generarToken}>
                🔐 Generar token para edición
              </Button>
              {tokenGenerado && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: "#e8f5e9" }}>
                  <Typography variant="body2">
                    <strong>Token generado:</strong> {tokenGenerado}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── LISTA DE VIGILANTES — Admin y Vigilante ── */}
      {(rol === "Administrador" || rol === "Vigilante") && info.vigilantes && info.vigilantes.length > 0 && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
              🛡️ {rol === "Administrador" ? "Vigilantes registrados" : "Compañeros vigilantes"}
            </Typography>

            <Grid container spacing={2}>
              {info.vigilantes
                // Si es Vigilante, excluirse a sí mismo de la lista
                .filter((v) => rol === "Administrador" || v.id !== parseInt(id))
                .map((v) => {
                  const caseta = getNombreCaseta(v.id_caseta);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={v.id}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: "1px solid #e3f2fd",
                          bgcolor: "#fafcff",
                          transition: "box-shadow 0.2s",
                          "&:hover": { boxShadow: 6 },
                          height: "100%",
                        }}
                      >
                        {/* Cabecera de la tarjeta */}
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ bgcolor: "#1976d2", width: 44, height: 44 }}>
                            <SecurityIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                              {v.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {v.id}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Caseta asignada */}
                        {caseta ? (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#e3f2fd",
                              borderRadius: 1.5,
                              borderLeft: "4px solid #1976d2",
                            }}
                          >
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                              <HomeIcon sx={{ fontSize: 14, color: "#1976d2" }} />
                              <Typography variant="caption" color="primary" fontWeight="bold">
                                CASETA {caseta.id}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.3 }}>
                              <LocationOnIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                              <Typography variant="body2" color="text.secondary">
                                {caseta.ubicacion}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PhoneIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                              <Typography variant="body2" color="text.secondary">
                                {caseta.telefono}
                              </Typography>
                            </Stack>
                          </Box>
                        ) : (
                          <Chip
                            label="Sin caseta asignada"
                            size="small"
                            variant="outlined"
                            color="default"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* AUTOS DEL RESIDENTE */}
      {rol === "Residente" && info.autos && info.autos.length > 0 && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}>
              🚗 Mis Autos
            </Typography>

            {info.autos.map((auto, index) => {
              const autorizadosDeAuto = info.autorizados.filter((aut) =>
                aut.autos?.some((a) => a.id === auto.id)
              );

              return (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                      <DirectionsCarIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        {auto.modelo} - {auto.placa}
                      </Typography>
                      {autorizadosDeAuto.length > 0 && (
                        <Chip
                          label={`${autorizadosDeAuto.length} autorizado(s)`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">ID DEL AUTO</Typography>
                        <Typography variant="body1">{auto.id}</Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">PLACA</Typography>
                        <Typography variant="body1">{auto.placa}</Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">MODELO</Typography>
                        <Typography variant="body1">{auto.modelo}</Typography>
                      </Box>

                      {autorizadosDeAuto.length > 0 && (
                        <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            PERSONAS AUTORIZADAS
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                            {autorizadosDeAuto.map((aut, i) => (
                              <Chip key={i} label={aut.nombre} color="primary" variant="outlined" />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* AUTOS AUTORIZADOS */}
      {info.autos_autorizados && info.autos_autorizados.length > 0 && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#ff9800", mb: 2 }}>
              🚗 Autos que puedes sacar
            </Typography>

            {info.autos_autorizados.map((auto, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DirectionsCarIcon color="warning" />
                    <Typography variant="h6" fontWeight="bold">
                      {auto.modelo} - {auto.placa}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box sx={{ p: 1.5, bgcolor: "#fff3e0", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">PROPIETARIO</Typography>
                      <Typography variant="body1">{auto.propietario}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">ID DEL AUTO</Typography>
                      <Typography variant="body1">{auto.id}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">PLACA</Typography>
                      <Typography variant="body1">{auto.placa}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">MODELO</Typography>
                      <Typography variant="body1">{auto.modelo}</Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PERSONAS AUTORIZADAS */}
      {rol === "Residente" && info.autorizados && info.autorizados.length > 0 && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}>
              👥 Personas Autorizadas
            </Typography>

            {info.autorizados.map((aut, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {aut.nombre}
                    </Typography>
                    {aut.autos && aut.autos.length > 0 && (
                      <Chip
                        label={`Puede usar ${aut.autos.length} auto(s)`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {aut.foto && (
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Avatar
                          src={`${API_URL}/static/perfiles/${aut.foto}?t=${Date.now()}`}
                          sx={{ width: 100, height: 100 }}
                        />
                      </Box>
                    )}
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">ID</Typography>
                      <Typography variant="body1">{aut.id}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">CELULAR</Typography>
                      <Typography variant="body1">{aut.celular}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">DOMICILIO</Typography>
                      <Typography variant="body1">{aut.domicilio}</Typography>
                    </Box>

                    {aut.autos && aut.autos.length > 0 && (
                      <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          AUTOS QUE PUEDE USAR
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                          {aut.autos.map((auto, i) => (
                            <Chip key={i} label={auto.placa} color="primary" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      {/* GESTIÓN DE PERMISOS */}
      {rol === "Residente" && (
        <Card elevation={3} sx={{ bgcolor: "#fff3e0" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#ff9800", mb: 2 }}>
              ⚙️ Gestionar permisos de uso del auto
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="ID del auto"
                type="number"
                value={idAuto}
                onChange={(e) => setIdAuto(e.target.value)}
                fullWidth
              />

              <TextField
                label="ID del residente o autorizado"
                type="number"
                value={idPersona}
                onChange={(e) => setIdPersona(e.target.value)}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="success" onClick={autorizarAuto} fullWidth>
                  ✅ Autorizar
                </Button>
                <Button variant="contained" color="error" onClick={desautorizarAuto} fullWidth>
                  ❌ Desautorizar
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Informacion;
