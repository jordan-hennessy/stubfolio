import { useState } from "react";

interface Setlist {
  id: string;
  eventDate: string;
  venue: {
    name: string;
    city: {
      name: string;
    };
  };
}

function AddConcertPage() {
  const [artistName, setArtistName] = useState("");
  const [results, setResults] = useState<Setlist[]>([]); //use Setlist Interface

  const handleSearch = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    fetch(
      `${import.meta.env.VITE_API_URL}/api/concerts/search_setlists/?artist_name=${artistName}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => setResults(data.setlist));
  };

  return (
    <div>
      <h1>Add a Concert</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={artistName}
          onChange={(event) => setArtistName(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <ul>
        {results.map((setlist) => (
          <li key={setlist.id}>
            {setlist.eventDate} - {setlist.venue.name},{" "}
            {setlist.venue.city.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddConcertPage;
