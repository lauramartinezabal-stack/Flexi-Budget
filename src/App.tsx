import { Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Home } from "./pages/Home";
import { AddEntry } from "./pages/AddEntry";
import { History } from "./pages/History";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-sand-50">
      <main className="flex-1 overflow-y-auto pb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
