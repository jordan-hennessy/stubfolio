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

    fetch(`${import.meta.env.VITE_API_URL}/api/concerts`, {
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

export default MyCollectionPage;
