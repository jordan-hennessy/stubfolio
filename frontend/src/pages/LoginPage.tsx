import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/api/login/`, {
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
          setError("Invalid username or password");
        }
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
      });
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
