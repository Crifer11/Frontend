import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Layout from "./components/Layout";
import Reporte from "./components/Reportes";
import Informacion from "./components/Informacion";
import Supervision from "./components/Supervision";
import Administrar from "./components/Administrar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rutas que usan el Layout con barra de navegación */}
        <Route element={<Layout />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/reportes" element={<Reporte />} />
          <Route path="/informacion" element={<Informacion />} />
          <Route path="/supervision" element={<Supervision />} />
          <Route path="/administracion" element={<Administrar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;