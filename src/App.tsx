import { Navigate, Route, Routes } from "react-router-dom";
import { SelecaoScreen } from "./pages/SelecaoScreen";
import { PDVScreen } from "./pages/PDVScreen";
import { RetaguardaLayout } from "./layouts/RetaguardaLayout";
import { PessoaListScreen } from "./modules/retaguarda/pessoas/PessoaListScreen";
import { PessoaFormScreen } from "./modules/retaguarda/pessoas/PessoaFormScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SelecaoScreen />} />
      <Route path="/pdv" element={<PDVScreen />} />

      <Route path="/retaguarda" element={<RetaguardaLayout />}>
        <Route index element={<Navigate to="pessoas" replace />} />
        <Route path="pessoas" element={<PessoaListScreen />} />
        <Route path="pessoas/novo" element={<PessoaFormScreen />} />
        <Route path="pessoas/:id" element={<PessoaFormScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;