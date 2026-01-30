import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Employees } from "@/views/Employees";
import { Attendence } from "./views/Attendence";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col items-center bg-bg text-text">
      <Navbar />
      <Routes>
        <Route path="/" element={<Employees/>} />
        <Route path="/about" element={<Attendence />}/>
      </Routes>
      <footer className="fixed bottom-0 left-0 w-full text-center py-1 text-sm text-muted bg-surface">
        &copy; {new Date().getFullYear()} Geonotes. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
