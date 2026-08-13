import { useState } from "react";
import { Loader2 } from "lucide-react";
//import { useNavigate } from "react-router-dom";

interface Artist {
  mbid: string;
  name: string;
  disambiguation: string;
}

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
  const [artists, setArtists] = useState<Artist[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [addedStubs, setAddedStubs] = useState<Record<string, number>>({});
  const [loadingSetlistId, setLoadingSetlistId] = useState<string | null>(null); // adding a loading wheel while a consert is being added

  //const navigate = useNavigate();

  const handleSearch = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    fetch(
      `${import.meta.env.VITE_API_URL}/api/concerts/search_artists/?artist_name=${artistName}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => setArtists(data.artist));
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);

    const token = localStorage.getItem("token");

    fetch(
      `${import.meta.env.VITE_API_URL}/api/concerts/artist_setlists/?mbid=${artist.mbid}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => setSetlists(data.setlist));
  };

  const handleCreateConcert = (setlistID: string) => {
    setLoadingSetlistId(setlistID);
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/concerts/create_from_setlist/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ setlist_id: setlistID }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAddedStubs((previous) => ({
          ...previous,
          [setlistID]: data.ticket_stub_id,
        }));
        setLoadingSetlistId(null);
      });
  };

  const handleRemoveConcert = (setlistID: string) => {
    const stubId = addedStubs[setlistID];
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/ticket-stubs/${stubId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }).then(() => {
      setAddedStubs((previous) => {
        const updated = { ...previous };
        delete updated[setlistID];
        return updated;
      });
    });
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

      {/* List of Artists */}
      {!selectedArtist && (
        <ul>
          {artists.map((artist) => (
            <li key={artist.mbid}>
              <button onClick={() => handleSelectArtist(artist)}>
                {artist.name}
                {artist.disambiguation && ` (${artist.disambiguation})`}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* List of Concerts */}
      {selectedArtist && (
        <div>
          <button onClick={() => setSelectedArtist(null)}>Back</button>
          <ul>
            {setlists.map((setlist) => (
              <li key={setlist.id}>
                {setlist.eventDate} - {setlist.venue.name},{" "}
                {setlist.venue.city.name}
                {addedStubs[setlist.id] ? (
                  <button onClick={() => handleRemoveConcert(setlist.id)}>
                    Remove
                  </button>
                ) : loadingSetlistId === setlist.id ? (
                  <Loader2 style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <button onClick={() => handleCreateConcert(setlist.id)}>
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AddConcertPage;
