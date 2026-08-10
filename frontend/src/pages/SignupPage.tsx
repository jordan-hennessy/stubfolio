import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/api/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/concerts");
        } else {
          setError(data.error || "Signup failed");
        }
      })
      .catch(() => {
        setError("EXAMPLE: Something went wrong");
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      {/* Large wrap <div> */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#1a1a1a",
          padding: "40px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "300px",
        }}
      >
        <h1 style={{ color: "white", margin: 10 }}>Signup Page</h1>

        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #333",
            backgroundColor: "#0d0d0d",
            color: "white",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #333",
            backgroundColor: "#0d0d0d",
            color: "white",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#e8c98a",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </form>
      {/* Large wrap <div> */}
    </div>
  );
}

export default SignupPage;
