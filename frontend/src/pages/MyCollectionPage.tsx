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

  return <h1>Concerts Page</h1>;
}

export default MyCollectionPage;
