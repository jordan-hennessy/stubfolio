import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyCollectionPage from "./pages/MyCollectionPage";
import AddConcertPage from "./pages/AddConcertPage";
import ConcertDetailPage from "./pages/ConcertDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
