import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Notifications } from "./pages/Notifications";
import { useBudgetStore } from "./store/useBudgetStore";

function App() {
  const runNotificationCheck = useBudgetStore((s) => s.runNotificationCheck);

  useEffect(() => {
    runNotificationCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}

export default App;
