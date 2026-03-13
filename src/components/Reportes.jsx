import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Stack, Box, Button, Divider } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { API_URL } from "./Menu"

function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  const rol = localStorage.getItem("rol");
  const id = localStorage.getItem("id");

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/reportes?id=${id}&rol=${rol}`
        );
        const data = await res.json();

        setReportes(data.reportes || []);
        setIncidentes(data.incidentes_menores || []);
      } catch (error) {
        console.error("Error al obtener reportes:", error);
      }
    };

    fetchReportes();
  }, [id, rol]);

  // ===================== COLUMNAS =====================

  const columnasReportes = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueFormatter: (value) =>
        new Date(value).toLocaleString(),
    },
    {
      field: "modelo",
      headerName: "Modelo",
      flex: 1,
    },
    {
      field: "motivo",
      headerName: "Motivo",
      flex: 1.5,
    },
    {
      field: "dueno",
      headerName: "Dueño",
      flex: 1.2,
    },
    {
      field: "pdf",
      headerName: "PDF",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // evita seleccionar fila
            const idReporte = params.row.fecha.replace("T", " ");
            window.open(
              `http://127.0.0.1:8000/descargar_pdf?id_reporte=${encodeURIComponent(
                idReporte
              )}`,
              "_blank"
            );
          }}
        >
          PDF
        </Button>
      ),
    },
  ];

  const columnasIncidentes = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueFormatter: (value) =>
        new Date(value).toLocaleString(),
    },
    {
      field: "titulo",
      headerName: "Título",
      flex: 1.5,
    },
    {
      field: "vigilante",
      headerName: "Vigilante",
      flex: 1.2,
    },
  ];

  // ===================== FILAS =====================

  const filasReportes = reportes.map((r, index) => ({
    id: index,
    raw: r,
    fecha: r[0],
    modelo: r[7],
    motivo: r[5],
    dueno: r[8],
  }));

  const filasIncidentes = incidentes.map((r, index) => ({
    id: index,
    raw: r,
    fecha: r[0],
    titulo: r[1],
    vigilante: r[3],
  }));

  // ===================== RENDER DETALLE =====================

  const renderInfoReporte = (r) => (
    <Card elevation={3}>  
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
          📋 Reporte seleccionado
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              FECHA
            </Typography>
            <Typography variant="body1">{r[0]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              CASETA
            </Typography>
            <Typography variant="body1">{r[3]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              VIGILANTE
            </Typography>
            <Typography variant="body1">{r[4]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, borderLeft: '4px solid #ff9800' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              MOTIVO
            </Typography>
            <Typography variant="body1">{r[5]}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
            🚗 Información del vehículo
          </Typography>

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              MODELO
            </Typography>
            <Typography variant="body1">{r[7]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              PLACA
            </Typography>
            <Typography variant="body1">{r[2]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              DUEÑO
            </Typography>
            <Typography variant="body1">{r[8]}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, borderLeft: '4px solid #2196f3' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              COMENTARIO
            </Typography>
            <Typography variant="body1">{r[6]}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" color="text.secondary" fontWeight="bold" sx={{ mt: 2 }}>
            📸 Evidencia fotográfica
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Rostro
            </Typography>
            <img
              src={`http://127.0.0.1:8000/static/reportes/${r[0].replace(/:/g, "").replace("T", " ").trim()}_rostro.jpg?t=${Date.now()}`}
              alt="Rostro"
              style={{ width: '100%', maxWidth: 300, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              onError={(e) => (e.target.style.display = "none")}
            />
          </Box>

          <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Placa
            </Typography>
            <img
              src={`http://127.0.0.1:8000/static/reportes/${r[0].replace(/:/g, "").replace("T", " ").trim()}_placa.jpg?t=${Date.now()}`}
              alt="Placa"
              style={{ width: '100%', maxWidth: 300, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              onError={(e) => (e.target.style.display = "none")}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderInfoIncidente = (r) => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="error" sx={{ fontWeight: 'bold', mb: 3 }}>
          ⚠️ Incidente menor
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              FECHA
            </Typography>
            <Typography variant="body1">{r[0]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              TÍTULO
            </Typography>
            <Typography variant="body1">{r[1]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, borderLeft: '4px solid #ff9800' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              CONTENIDO
            </Typography>
            <Typography variant="body1">{r[2]}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              VIGILANTE
            </Typography>
            <Typography variant="body1">{r[3]}</Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              CASETA
            </Typography>
            <Typography variant="body1">{r[4]}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // ===================== UI =====================

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box sx={{ width: "45%", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reportes
        </Typography>

        <DataGrid
          rows={filasReportes}
          columns={columnasReportes}
          pageSizeOptions={[5, 10, 20]}
          autoHeight={false}
          sx={{
            height: 350,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1976d2',
              color: 'white',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            },
            // Esta es la clave - el separador también necesita color
            '& .MuiDataGrid-columnSeparator': {
              color: 'white',
            },
            // Por si acaso, forzamos el color en toda la celda del header
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#1976d2',
              color: 'white',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#007b8b',
            },
            // Fila seleccionada
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: '#c76000', // azul clarito
              '&:hover': {
                backgroundColor: '#fc0d0d', // un poco más oscuro al pasar el mouse
              },
            },
          }}
          onRowClick={(params) =>
            setSeleccionado({ tipo: "reporte", datos: params.row.raw })
          }
        />

        {rol !== "Residente" && (
          <>
            <Typography variant="h6" sx={{ mt: 4 }}>
              Incidentes menores
            </Typography>

            <DataGrid
              rows={filasIncidentes}
              columns={columnasIncidentes}
              autoHeight
              sx={{
                height: 350,
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                },
                // Esta es la clave - el separador también necesita color
                '& .MuiDataGrid-columnSeparator': {
                  color: 'white',
                },
                // Por si acaso, forzamos el color en toda la celda del header
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#007b8b',
                },
                // Fila seleccionada
                    '& .MuiDataGrid-row.Mui-selected': {
                    backgroundColor: '#c76000', // azul clarito
                    '&:hover': {
                      backgroundColor: '#fc0d0d', // un poco más oscuro al pasar el mouse
                    },
                  },
              }}
              pageSizeOptions={[5, 10]}
              onRowClick={(params) =>
                setSeleccionado({ tipo: "mini", datos: params.row.raw })
              }
            />
          </>
        )}
      </Box>

      <Box sx={{ flex: 1, p: 3, borderLeft: "1px solid #ddd" }}>
        {seleccionado ? (
          seleccionado.tipo === "reporte"
            ? renderInfoReporte(seleccionado.datos)
            : renderInfoIncidente(seleccionado.datos)
        ) : (
          <Typography color="text.secondary">
            Selecciona un registro para ver los detalles
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Reportes;
