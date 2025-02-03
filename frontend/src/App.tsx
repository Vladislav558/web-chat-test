import RoutesProvider from "@/routes";
import { ToastContainer } from "react-toastify";
import MainLayer from "@/layers/Main/Main";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
        <MainLayer>
          <RoutesProvider />
        </MainLayer>
    </>
  );
}

export default App;
