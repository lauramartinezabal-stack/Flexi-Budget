import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AddSheet } from "./components/AddSheet";
import { BottomNav } from "./components/BottomNav";
import { AddExpense } from "./screens/AddExpense";
import { AddIncome } from "./screens/AddIncome";
import { Dashboard } from "./screens/Dashboard";
import { History } from "./screens/History";
import { Notifications } from "./screens/Notifications";

function App() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/add/income" element={<AddIncome />} />
          <Route path="/add/expense" element={<AddExpense />} />
        </Routes>
      </main>

      <BottomNav onAddClick={() => setSheetOpen(true)} />

      {sheetOpen && <AddSheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}

export default App;
