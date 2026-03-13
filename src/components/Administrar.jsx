import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  Chip,
  Stack,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SecurityIcon from "@mui/icons-material/Security";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import { API_URL } from "./Menu"

function Administracion() {
  const { enqueueSnackbar } = useSnackbar();
  const [tipo, setTipo] = useState("");
  const [modo, setModo] = useState("buscar");
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [info, setInfo] = useState(null);
  const [token, setToken] = useState("");
  const [tokenValidado, setTokenValidado] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);

  // Buscar coincidencias
  const buscar = async () => {
    if (!tipo) {
      enqueueSnackbar("Selecciona un tipo primero", { variant: "warning" });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/buscar?tipo=${tipo}&query=${query}`
      );
      const data = await response.json();
      if (data.coincidencias) {
        setResultados(data.coincidencias);
        if (data.coincidencias.length === 0) {
          enqueueSnackbar("No se encontraron resultados", { variant: "info" });
        }
      } else {
        setResultados([]);
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      enqueueSnackbar("Error al buscar", { variant: "error" });
      setResultados([]);
    }
  };

  // Cargar info detallada
  useEffect(() => {
    const cargarInfo = async () => {
      if (seleccionado) {
        try {
          const tipoCap = tipo.charAt(0).toUpperCase() + tipo.slice(1);
          const response = await fetch(
            `${API_URL}/informacion?id=${seleccionado.id}&rol=${tipoCap}`
          );
          const data = await response.json();
          setInfo(data);
        } catch (error) {
          console.error("Error al obtener información:", error);
          enqueueSnackbar("Error al cargar información", { variant: "error" });
        }
      }
    };
    cargarInfo();
  }, [seleccionado, tipo]);

  const verificarToken = async () => {
    let idUsuario;

    if (tipo === "auto") {
      idUsuario = await obtenerIdResidentePorNombre(info.titular);
    } else {
      idUsuario = seleccionado?.id;
    }

    if (!idUsuario) {
      enqueueSnackbar("No se pudo obtener el ID del usuario", { variant: "error" });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/verificar_token/?id_usuario=${idUsuario}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        enqueueSnackbar("Token validado correctamente", { variant: "success" });
        setTokenValidado(true);
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch (error) {
      console.error("Error al verificar token:", error);
      enqueueSnackbar("Error al conectar con el servidor", { variant: "error" });
    }
  };

  const obtenerIdResidentePorNombre = async (nombre) => {
    try {
      const res = await fetch(
        `${API_URL}/residente_id_por_nombre?nombre=${encodeURIComponent(
          nombre
        )}`
      );
      const data = await res.json();
      return data.id;
    } catch (error) {
      console.error("Error al obtener ID del residente:", error);
      return null;
    }
  };

  const handleEliminar = async () => {
    try {
      let endpoint = "";
      let method = "DELETE";
      let body = null;

      switch (tipo) {
        case "caseta":
          const formDataCaseta = new FormData();
          formDataCaseta.append("id_caseta", seleccionado.id);
          endpoint = `${API_URL}/caseta/eliminar`;
          method = "POST";
          body = formDataCaseta;
          break;
        case "vigilante":
          endpoint = `${API_URL}/vigilante/eliminar?id=${info.id}`;
          break;
        case "auto":
          endpoint = `${API_URL}/auto/eliminar?id=${info.id}`;
          break;
        case "residente":
        case "autorizado":
          endpoint = `${API_URL}/persona/eliminar?id=${info.id}&rol=${tipo}`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, { method, body });
      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar(data.mensaje, { variant: "success" });
        setDialogEliminar(false);
        setModo("buscar");
        setInfo(null);
        setSeleccionado(null);
        setResultados([]);
      } else {
        enqueueSnackbar(data.detail, { variant: "error" });
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      enqueueSnackbar("Error al conectar con el servidor", { variant: "error" });
    }
  };

  const volverABuscar = () => {
    setModo("buscar");
    setInfo(null);
    setSeleccionado(null);
    setToken("");
    setTokenValidado(false);
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case "residente":
      case "autorizado":
        return <PersonIcon />;
      case "auto":
        return <DirectionsCarIcon />;
      case "vigilante":
        return <SecurityIcon />;
      case "caseta":
        return <HomeIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "transparent" }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2", mb: 4 }}
      >
        ⚙️ Administración
      </Typography>

      {/* BARRA DE BÚSQUEDA */}
      {modo === "buscar" && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={tipo}
                    label="Tipo"
                    onChange={(e) => {
                      setTipo(e.target.value);
                      setSeleccionado(null);
                      setInfo(null);
                      setResultados([]);
                    }}
                  >
                    <MenuItem value="residente">Residente</MenuItem>
                    <MenuItem value="autorizado">Autorizado</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                    <MenuItem value="vigilante">Vigilante</MenuItem>
                    <MenuItem value="caseta">Caseta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Buscar por ID o Nombre"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscar()}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={buscar}
                  sx={{ height: 56 }}
                >
                  Buscar
                </Button>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (!tipo) {
                      enqueueSnackbar("Selecciona un tipo primero", {
                        variant: "warning",
                      });
                      return;
                    }
                    setModo("alta");
                    setSeleccionado(null);
                    setInfo(null);
                  }}
                  sx={{ height: 56 }}
                >
                  Nuevo
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* MOSTRAR RESULTADOS */}
      {modo === "buscar" && !info && resultados.length > 0 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Resultados ({resultados.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {resultados.map((r, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f5f5f5" },
                      border:
                        seleccionado?.id === r.id ? "2px solid #1976d2" : "none",
                    }}
                    onClick={() => setSeleccionado(r)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#1976d2" }}>
                          {getIconByType(tipo)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {r.nombre || r.placa}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {r.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* INFORMACIÓN DETALLADA */}
      {modo === "buscar" && info && (
        <Card elevation={3}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    setSeleccionado(null);
                    setInfo(null);
                  }}
                >
                  Volver a resultados
                </Button>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                  Información Detallada
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setModo("editar")}
              >
                Editar
              </Button>
            </Box>

            {/* RESIDENTE */}
            {tipo === "residente" && (
              <Box>
                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                  {info.foto ? (
                    <Avatar
                      src={`${API_URL}/static/perfiles/${info.foto}?t=${Date.now()}`}
                      sx={{ width: 100, height: 100 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 100, height: 100, bgcolor: "#1976d2" }}>
                      <PersonIcon sx={{ fontSize: 50 }} />
                    </Avatar>
                  )}

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {info.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {info.id}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        CELULAR
                      </Typography>
                      <Typography variant="body1">{info.celular}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        DOMICILIO
                      </Typography>
                      <Typography variant="body1">{info.domicilio}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}>
                  🚗 Autos ({info.autos?.length || 0})
                </Typography>
                {info.autos && info.autos.length > 0 ? (
                  info.autos.map((auto, index) => (
                    <Accordion key={index} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <DirectionsCarIcon color="primary" />
                          <Typography variant="h6" fontWeight="bold">
                            {auto.modelo} - {auto.placa}
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ID DEL AUTO
                            </Typography>
                            <Typography variant="body1">{auto.id}</Typography>
                          </Box>
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              PLACA
                            </Typography>
                            <Typography variant="body1">{auto.placa}</Typography>
                          </Box>
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              MODELO
                            </Typography>
                            <Typography variant="body1">{auto.modelo}</Typography>
                          </Box>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tiene autos registrados
                  </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}>
                  👥 Personas Autorizadas ({info.autorizados?.length || 0})
                </Typography>
                {info.autorizados && info.autorizados.length > 0 ? (
                  info.autorizados.map((a, i) => (
                    <Accordion key={i} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <PersonIcon color="primary" />
                          <Typography variant="h6" fontWeight="bold">
                            {a.nombre}
                          </Typography>
                          {a.autos && a.autos.length > 0 && (
                            <Chip
                              label={`Puede usar ${a.autos.length} auto(s)`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {a.foto && (
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              <Avatar
                                src={`${API_URL}/static/perfiles/${a.foto}?t=${Date.now()}`}
                                sx={{ width: 80, height: 80 }}
                              />
                            </Box>
                          )}
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ID
                            </Typography>
                            <Typography variant="body1">{a.id}</Typography>
                          </Box>
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              CELULAR
                            </Typography>
                            <Typography variant="body1">{a.celular}</Typography>
                          </Box>
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              DOMICILIO
                            </Typography>
                            <Typography variant="body1">{a.domicilio}</Typography>
                          </Box>

                          {a.autos && a.autos.length > 0 && (
                            <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                AUTOS QUE PUEDE USAR
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                {a.autos.map((auto, idx) => (
                                  <Chip
                                    key={idx}
                                    label={auto.placa}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tiene personas autorizadas
                  </Typography>
                )}
              </Box>
            )}

            {/* AUTORIZADO */}
            {tipo === "autorizado" && (
              <Box>
                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                  {info.foto ? (
                    <Avatar
                      src={`${API_URL}/static/perfiles/${info.foto}?t=${Date.now()}`}
                      sx={{ width: 100, height: 100 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 100, height: 100, bgcolor: "#1976d2" }}>
                      <PersonIcon sx={{ fontSize: 50 }} />
                    </Avatar>
                  )}

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {info.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {info.id}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        CELULAR
                      </Typography>
                      <Typography variant="body1">{info.celular}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        DOMICILIO
                      </Typography>
                      <Typography variant="body1">{info.domicilio}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ff9800", mb: 2 }}>
                  🚗 Autos Autorizados ({info.autos_autorizados?.length || 0})
                </Typography>
                {info.autos_autorizados && info.autos_autorizados.length > 0 ? (
                  info.autos_autorizados.map((auto, idx) => (
                    <Accordion key={idx} sx={{ mb: 1 }}>
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
                            <Typography variant="caption" color="text.secondary">
                              PROPIETARIO
                            </Typography>
                            <Typography variant="body1">{auto.propietario}</Typography>
                          </Box>
                          <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ID
                            </Typography>
                            <Typography variant="body1">{auto.id}</Typography>
                          </Box>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tiene autos autorizados
                  </Typography>
                )}
              </Box>
            )}

            {/* AUTO */}
            {tipo === "auto" && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      ID
                    </Typography>
                    <Typography variant="body1">{info.id}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      PLACA
                    </Typography>
                    <Typography variant="body1">{info.placa}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      MODELO
                    </Typography>
                    <Typography variant="body1">{info.modelo}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1, borderLeft: "4px solid #2196f3" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      TITULAR
                    </Typography>
                    <Typography variant="body1">{info.titular}</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* VIGILANTE */}
            {tipo === "vigilante" && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        ID
                      </Typography>
                      <Typography variant="body1">{info.id}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        NOMBRE
                      </Typography>
                      <Typography variant="body1">{info.nombre}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        CELULAR
                      </Typography>
                      <Typography variant="body1">{info.celular}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {info.caseta ? (
                  <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 2, borderLeft: "4px solid #2196f3" }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                      🏠 Caseta Asignada
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>ID:</strong> {info.caseta.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Teléfono:</strong> {info.caseta.telefono}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Ubicación:</strong> {info.caseta.ubicacion}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tiene caseta asignada
                  </Typography>
                )}
              </Box>
            )}

            {/* CASETA */}
            {tipo === "caseta" && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        ID
                      </Typography>
                      <Typography variant="body1">{info.id}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        TELÉFONO
                      </Typography>
                      <Typography variant="body1">{info.telefono}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        UBICACIÓN
                      </Typography>
                      <Typography variant="body1">{info.ubicacion}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}>
                  👮 Vigilantes Asignados ({info.vigilantes?.length || 0})
                </Typography>
                {info.vigilantes && info.vigilantes.length > 0 ? (
                  info.vigilantes.map((v, index) => (
                    <Box key={index} sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1, mb: 1, borderLeft: "4px solid #2196f3" }}>
                      <Typography variant="body1" fontWeight="bold">
                        {v.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {v.id}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay vigilantes asignados
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* FORMULARIOS DE ALTA Y EDICIÓN */}
      {(modo === "alta" || modo === "editar") && (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#ff9800" }}>
                {modo === "alta" ? "➕ Registrar " : "✏️ Editar "}
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={volverABuscar}
              >
                Cancelar
              </Button>
            </Box>

            {/* FORMULARIO CASETA */}
            {tipo === "caseta" && (
              <Box
                component="form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);

                  if (modo === "editar" && seleccionado) {
                    formData.append("id_caseta", seleccionado.id);
                  }

                  try {
                    const response = await fetch(
                      `${API_URL}/caseta/guardar`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    const data = await response.json();
                    if (response.ok) {
                      enqueueSnackbar(data.mensaje, { variant: "success" });
                      volverABuscar();
                    } else {
                      enqueueSnackbar(data.detail, { variant: "error" });
                    }
                  } catch (error) {
                    enqueueSnackbar("Error al conectar con el servidor", {
                      variant: "error",
                    });
                  }
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ubicación"
                      name="ubicacion"
                      defaultValue={modo === "editar" && info ? info.ubicacion : ""}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      defaultValue={modo === "editar" && info ? info.telefono : ""}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ID del vigilante (opcional)"
                      name="id_vigilante"
                      type="number"
                      defaultValue={
                        modo === "editar" && info?.vigilante
                          ? info.vigilante.id
                          : ""
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        fullWidth
                      >
                        {modo === "editar" ? "Guardar cambios" : "Registrar"}
                      </Button>
                      {modo === "editar" && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDialogEliminar(true)}
                          fullWidth
                        >
                          Eliminar
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* FORMULARIO VIGILANTE */}
            {tipo === "vigilante" && (
              <Box
                component="form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);

                  if (modo === "editar" && seleccionado) {
                    formData.append("id_vigilante", seleccionado.id);
                  }

                  try {
                    const response = await fetch(
                      `${API_URL}/vigilante/guardar`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    const data = await response.json();
                    if (response.ok) {
                      enqueueSnackbar(data.mensaje, { variant: "success" });
                      volverABuscar();
                    } else {
                      enqueueSnackbar(data.detail, { variant: "error" });
                    }
                  } catch (error) {
                    enqueueSnackbar("Error al conectar con el servidor", {
                      variant: "error",
                    });
                  }
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="nombre"
                      defaultValue={modo === "editar" && info ? info.nombre : ""}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Celular"
                      name="celular"
                      defaultValue={modo === "editar" && info ? info.celular : ""}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ID de caseta"
                      name="id_caseta"
                      type="number"
                      defaultValue={
                        modo === "editar" && info?.caseta ? info.caseta.id : ""
                      }
                      required
                    />
                  </Grid>
                  {modo === "alta" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contraseña"
                        name="contraseña"
                        type="password"
                        required
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        fullWidth
                      >
                        {modo === "editar" ? "Guardar cambios" : "Registrar"}
                      </Button>
                      {modo === "editar" && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDialogEliminar(true)}
                          fullWidth
                        >
                          Eliminar
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* FORMULARIO AUTO */}
            {tipo === "auto" && (
              <Box>
                {modo === "editar" && !tokenValidado && (
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      🔐 Validación de token
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Este token debe ser generado por el residente y entregado al
                      administrador.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        label="Token de autorización"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Ingresa el token"
                      />
                      <Button
                        variant="contained"
                        onClick={verificarToken}
                        sx={{ minWidth: 150 }}
                      >
                        Validar
                      </Button>
                    </Stack>
                  </Paper>
                )}

                {(modo === "alta" || tokenValidado) && (
                  <Box
                    component="form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);

                      if (modo === "editar" && seleccionado) {
                        formData.append("id_auto", seleccionado.id);
                      }

                      try {
                        const response = await fetch(
                          `${API_URL}/auto/guardar`,
                          {
                            method: "POST",
                            body: formData,
                          }
                        );

                        const data = await response.json();
                        if (response.ok) {
                          enqueueSnackbar(data.mensaje, { variant: "success" });
                          volverABuscar();
                        } else {
                          enqueueSnackbar(data.detail, { variant: "error" });
                        }
                      } catch (error) {
                        enqueueSnackbar("Error al conectar con el servidor", {
                          variant: "error",
                        });
                      }
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Placa"
                          name="placa"
                          defaultValue={modo === "editar" && info ? info.placa : ""}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Modelo"
                          name="modelo"
                          defaultValue={modo === "editar" && info ? info.modelo : ""}
                          required
                          InputProps={{
                            readOnly: modo === "editar",
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="ID del Titular"
                          name="id_titular"
                          type="number"
                          defaultValue={
                            modo === "editar" && info ? info.id_titular : ""
                          }
                          required
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            fullWidth
                          >
                            {modo === "editar" ? "Guardar cambios" : "Registrar"}
                          </Button>
                          {modo === "editar" && tokenValidado && (
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => setDialogEliminar(true)}
                              fullWidth
                            >
                              Eliminar
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}

            {/* FORMULARIO RESIDENTE/AUTORIZADO */}
            {(tipo === "residente" || tipo === "autorizado") && (
              <Box>
                {modo === "editar" && !tokenValidado && (
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      🔐 Validación de token
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      El residente debe generar un token para autorizar cambios.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        label="Token de autorización"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Ingresa el token"
                      />
                      <Button
                        variant="contained"
                        onClick={verificarToken}
                        sx={{ minWidth: 150 }}
                      >
                        Validar
                      </Button>
                    </Stack>
                  </Paper>
                )}

                {(modo === "alta" || tokenValidado) && (
                  <Box
                    component="form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      formData.append(
                        "rol",
                        tipo.charAt(0).toUpperCase() + tipo.slice(1)
                      );

                      if (modo === "editar" && seleccionado) {
                        formData.append("id_residente", seleccionado.id);
                        formData.append("token", token);
                      }

                      try {
                        const response = await fetch(
                          `${API_URL}/residente/guardar`,
                          {
                            method: "POST",
                            body: formData,
                          }
                        );

                        const data = await response.json();
                        if (response.ok) {
                          enqueueSnackbar(data.mensaje, { variant: "success" });
                          volverABuscar();
                        } else {
                          enqueueSnackbar(data.detail, { variant: "error" });
                        }
                      } catch (error) {
                        enqueueSnackbar("Error al conectar con el servidor", {
                          variant: "error",
                        });
                      }
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nombre"
                          name="nombre"
                          defaultValue={modo === "editar" ? info?.nombre : ""}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Celular"
                          name="celular"
                          defaultValue={modo === "editar" ? info?.celular : ""}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Domicilio"
                          name="domicilio"
                          defaultValue={modo === "editar" ? info?.domicilio : ""}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Foto de perfil
                          </Typography>
                          <input type="file" name="foto" accept="image/*" />
                        </Box>
                      </Grid>

                      {modo === "alta" && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Contraseña"
                            name="contraseña"
                            type="password"
                            required
                          />
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            fullWidth
                          >
                            {modo === "editar" ? "Guardar cambios" : "Registrar"}
                          </Button>
                          {modo === "editar" && tokenValidado && (
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => setDialogEliminar(true)}
                              fullWidth
                            >
                              Eliminar
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* DIALOG DE CONFIRMACIÓN PARA ELIMINAR */}
      <Dialog open={dialogEliminar} onClose={() => setDialogEliminar(false)}>
        <DialogTitle>⚠️ Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este {tipo}? Esta acción no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEliminar(false)}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Administracion;
