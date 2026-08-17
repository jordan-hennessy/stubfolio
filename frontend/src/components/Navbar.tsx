import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        backgroundColor: "#1a1a1a",
        color: "white",
      }}
    >
      <Link
        to="/concerts"
        style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}
      >
        Stubfolio
      </Link>

      {token && (
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            to="/concerts"
            style={{ color: "white", textDecoration: "none" }}
          >
            My Collection
          </Link>
          <Link
            to="/concerts/add"
            style={{ color: "white", textDecoration: "none" }}
          >
            Add Concert
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
