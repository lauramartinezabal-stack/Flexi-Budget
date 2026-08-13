import { Route, Routes } from "react-router-dom";
import { Home } from "./screens/Home";
import { Add } from "./screens/Add";
import { History } from "./screens/History";
import { Notifications } from "./screens/Notifications";
import { BottomNav } from "./components/BottomNav";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;
