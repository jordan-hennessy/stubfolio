import { useState, useEffect } from "react";

interface Concert {
  id: number;
  artist_name: string;
  venue_name: string;
  city: string;
  date: string;
  genre_tags: string[];
}

function MyCollectionPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/concerts/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setConcerts(data));
  }, []);

  return (
    <div>
      <h1>My Collection</h1>

      {/* Grid container: automatically fits as many cards per row as space allows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {concerts.map((concert) => (
          // One card per concert
          <div
            key={concert.id}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              overflow: "hidden",
              color: "white",
            }}
          >
            {/* Placeholder for the eventually-generated ticket design image */}
            <div style={{ backgroundColor: "#32ffa3", height: "150px" }}></div>

            <p>{concert.genre_tags[0]}</p>
            <h3>{concert.artist_name}</h3>
            <p>{concert.venue_name}</p>
            <p>
              {concert.city} — {concert.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCollectionPage;
