import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import StubfolioLogo from "../assets/stubfolio-mark.svg";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const location = useLocation();

  {
    /* Give scroll shadow */
  }
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex justify-between items-center px-8 py-5 bg-brand-card text-white transition-shadow ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <Link
        to="/concerts"
        className="flex items-center gap-2 text-white font-bold no-underline"
      >
        <img src={StubfolioLogo} alt="Stubfolio" className="h-8 w-8" />
        <span className="font-brand-mono text-xl">Stubfolio</span>
      </Link>

      {token && (
        <div className="flex gap-4 items-center text-base">
          <Link
            to="/concerts"
            className={`no-underline transition-colors hover:text-brand-gold ${
              location.pathname === "/concerts"
                ? "text-brand-gold"
                : "text-white"
            }`}
          >
            My Collection
          </Link>
          <Link
            to="/concerts/add"
            className={`no-underline transition-colors hover:text-brand-gold ${
              location.pathname === "/concerts/add"
                ? "text-brand-gold"
                : "text-white"
            }`}
          >
            Add Concert
          </Link>
          <button
            onClick={handleLogout}
            className="cursor-pointer hover:text-brand-gold transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
