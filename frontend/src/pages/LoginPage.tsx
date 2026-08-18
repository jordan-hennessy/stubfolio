import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="min-h-[calc(100vh-88px)] flex justify-center items-center bg-brand-bg">
      <div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-75 p-10 rounded-xl bg-brand-card"
        >
          <h1 className="text-white text-2xl font-brand-mono">Login</h1>

          {error && <p className="text-brand-error">{error}</p>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="p-2.5 rounded-md border border-gray-800 bg-brand-bg text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="p-2.5 rounded-md border border-gray-800 bg-brand-bg text-white"
          />

          <button
            type="submit"
            className="p-2.5 rounded-md bg-brand-gold font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Log in
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-brand-gold hover:opacity-80 transition-opacity"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
