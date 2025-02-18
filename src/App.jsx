import './App.css'
import CalcByNet from './SSv1/CalcByNet'
import CalcBySb from './SSv1/CalcBySb';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex space-x-4 justify-center">
          <Link
            to="/sb"
            className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Calculer par Salaire de Base
          </Link>
          <Link
            to="/net"
            className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Calculer par Salaire Net
          </Link>
        </div>
      </nav>
     
      <Routes>
        <Route path="/sb" element={<CalcBySb />} />
        <Route path="/net" element={<CalcByNet />} />
        {/* Redirect to one of the calculators if no match */}
        <Route path="*" element={<CalcBySb />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
