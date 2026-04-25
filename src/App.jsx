import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Layout from "./components/Layout";
import Reporte from "./components/Reportes";
import Informacion from "./components/Informacion";
import Supervision from "./components/Supervision";
import Administrar from "./components/Administrar";
import { API_URL } from "./components/Menu";

function App() {
  // useRef para guardar la conexión SSE sin causar re-renders
  const sseRef = useRef(null);

  const conectarSSE = (idVigilante) => {
    // Si ya hay una conexión abierta, no abrir otra
    if (sseRef.current) return;

    const sse = new EventSource(`${API_URL}/sse/${idVigilante}`);

    sse.onerror = () => {
      console.error("SSE: error de conexión, reintentando...");
    };

    sseRef.current = sse;
  };

  const desconectarSSE = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
  };

  // Al cargar la app, si ya hay un vigilante con sesión activa
  // (por ejemplo si recarga la página) reconectar el SSE
  useEffect(() => {
    const rol = localStorage.getItem("rol");
    const id  = localStorage.getItem("id");

    if (rol === "Vigilante" && id) {
      conectarSSE(id);
    }

    // Limpiar al cerrar/recargar la pestaña
    return () => desconectarSSE();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Login
            onLoginExitoso={(rol, id) => {
              if (rol === "Vigilante") conectarSSE(id);
            }}
            onLogout={desconectarSSE}
          />}
        />

        {/* Rutas que usan el Layout con barra de navegación */}
        <Route element={<Layout onLogout={desconectarSSE} />}>
          <Route path="/menu"          element={<Menu />} />
          <Route path="/reportes"      element={<Reporte />} />
          <Route path="/informacion"   element={<Informacion />} />
          <Route path="/supervision"   element={<Supervision sseRef={sseRef} />} />
          <Route path="/administracion" element={<Administrar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
