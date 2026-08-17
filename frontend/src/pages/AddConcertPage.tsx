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
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6 font-brand-mono">Add a Concert</h1>

      <form onSubmit={handleSearch} className="flex gap-2.5 mb-8">
        <input
          type="text"
          value={artistName}
          onChange={(event) => setArtistName(event.target.value)}
          placeholder="Search for an artist..."
          className="flex-1 p-2.5 rounded-md border border-gray-800 bg-neutral-950 text-white"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-md bg-amber-400 font-bold cursor-pointer"
        >
          Search
        </button>
      </form>

      {!selectedArtist && (
        <ul className="list-none p-0 flex flex-col gap-2">
          {artists.map((artist) => (
            <li key={artist.mbid}>
              <button
                onClick={() => handleSelectArtist(artist)}
                className="w-full text-left p-3 rounded-md border border-gray-800 bg-neutral-900 text-white cursor-pointer"
              >
                {artist.name}
                {artist.disambiguation && (
                  <span className="text-gray-500">
                    {" "}
                    ({artist.disambiguation})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedArtist && (
        <div>
          <button
            onClick={() => setSelectedArtist(null)}
            className="mb-4 px-4 py-2 rounded-md border border-gray-800 bg-transparent text-white cursor-pointer"
          >
            ← Back
          </button>

          <ul className="list-none p-0 flex flex-col gap-2">
            {setlists.map((setlist) => (
              <li
                key={setlist.id}
                className="flex justify-between items-center p-3 rounded-md bg-neutral-900"
              >
                <span>
                  {setlist.eventDate} — {setlist.venue.name},{" "}
                  {setlist.venue.city.name}
                </span>

                {addedStubs[setlist.id] ? (
                  <button
                    onClick={() => handleRemoveConcert(setlist.id)}
                    className="px-3.5 py-1.5 rounded-md border border-red-400 bg-transparent text-red-400 cursor-pointer"
                  >
                    Remove
                  </button>
                ) : loadingSetlistId === setlist.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <button
                    onClick={() => handleCreateConcert(setlist.id)}
                    className="px-3.5 py-1.5 rounded-md bg-amber-200 font-bold cursor-pointer"
                  >
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
