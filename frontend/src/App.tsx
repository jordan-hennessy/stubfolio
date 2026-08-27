import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyCollectionPage from "./pages/MyCollectionPage";
import AddConcertPage from "./pages/AddConcertPage";
import ConcertDetailPage from "./pages/ConcertDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/concerts" element={<MyCollectionPage />} />
        <Route path="/concerts/add" element={<AddConcertPage />} />
        <Route path="/concerts/:id" element={<ConcertDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
