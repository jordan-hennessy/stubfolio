import { useState, useEffect } from "react";

interface Concert {
  id: number;
  artist_name: string;
  venue_name: string;
  city: string;
  date: string;
}

function App() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/concerts/")
      .then((response) => response.json())
      .then((data) => setConcerts(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Stubfolio</h1>
      {error && <p>Error: {error}</p>}
      <ul>
        {concerts.map((concert) => (
          <li key={concert.id}>
            {concert.artist_name} - {concert.venue_name}, {concert.city} (
            {concert.date})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
