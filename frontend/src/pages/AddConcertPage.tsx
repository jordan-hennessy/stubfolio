import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Select from "react-select";

import countryList from "country-list";

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
  const [loadingSetlistId, setLoadingSetlistId] = useState<string | null>(null);

  const [setlistError, setSetlistError] = useState<string | null>(null);

  // Debouncing auto-filter
  const [yearFilter, setYearFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const countries = countryList
    .getData()
    .map((country: { code: string; name: string }) => ({
      label: country.name,
      value: country.code,
    }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i).map(
    (year) => ({
      label: String(year),
      value: String(year),
    }),
  );

  const yearOptions = [{ label: "Any Year", value: "" }, ...years];
  const countryOptions = [{ label: "Any Country", value: "" }, ...countries];

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

  const fetchSetlists = (mbid: string, year: string, countryCode: string) => {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams({ mbid });
    if (year) params.append("year", year);
    if (countryCode) params.append("country_code", countryCode);

    fetch(
      `${import.meta.env.VITE_API_URL}/api/concerts/artist_setlists/?${params}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.setlist) {
          setSetlists(data.setlist);
          setSetlistError(null);
        } else {
          setSetlists([]);
          setSetlistError("Couldn't load shows. Retrying...");
          setTimeout(() => fetchSetlists(mbid, year, countryCode), 1500);
        }
      });
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    fetchSetlists(artist.mbid, yearFilter, countryFilter);
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

  useEffect(() => {
    if (!selectedArtist) return;

    const timer = setTimeout(() => {
      fetchSetlists(selectedArtist.mbid, yearFilter, countryFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [yearFilter, countryFilter]);

  const selectClassNames = {
    control: () => "bg-brand-card border border-gray-800 rounded-md px-1 w-48",
    singleValue: () => "text-white",
    input: () => "text-white",
    menu: () => "bg-brand-card border border-gray-800 rounded-md mt-1",
    option: ({ isFocused }: { isFocused: boolean }) =>
      isFocused ? "bg-brand-gold text-black px-3 py-2" : "text-white px-3 py-2",
    placeholder: () => "text-gray-500",
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-brand-bg text-white p-10">
      <h1 className="text-3xl font-bold mb-6 font-brand-mono">Add a Concert</h1>

      <form onSubmit={handleSearch} className="flex gap-2.5 mb-8">
        <input
          type="text"
          value={artistName}
          onChange={(event) => setArtistName(event.target.value)}
          placeholder="Search for an artist..."
          className="flex-1 p-2.5 rounded-md border border-gray-800 bg-brand-card text-white"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-md bg-brand-gold font-bold cursor-pointer hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {setlistError && <p className="text-brand-error mb-2">{setlistError}</p>}

      {!selectedArtist && (
        <ul className="list-none p-0 flex flex-col gap-2">
          {artists.map((artist) => (
            <li key={artist.mbid}>
              <button
                onClick={() => handleSelectArtist(artist)}
                className="w-full text-left p-3 rounded-md border border-gray-800 bg-brand-card text-white cursor-pointer hover:border-brand-gold transition-colors"
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
            className="mb-4 px-4 py-2 rounded-md border border-gray-800 bg-transparent text-white cursor-pointer hover:border-brand-gold transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-3 mb-4">
            <Select
              options={yearOptions}
              value={yearOptions.find((y) => y.value === yearFilter) || null}
              onChange={(selected) =>
                setYearFilter(selected ? selected.value : "")
              }
              placeholder="Year"
              unstyled
              classNames={selectClassNames}
            />
            <Select
              options={countryOptions}
              value={
                countryOptions.find((c) => c.value === countryFilter) || null
              }
              onChange={(selected) =>
                setCountryFilter(selected ? selected.value : "")
              }
              placeholder="Country"
              unstyled
              classNames={selectClassNames}
            />
          </div>

          <ul className="list-none p-0 flex flex-col gap-2">
            {setlists.map((setlist) => (
              <li
                key={setlist.id}
                className="flex justify-between items-center p-3 rounded-md bg-brand-card"
              >
                <span>
                  {setlist.eventDate} — {setlist.venue.name},{" "}
                  {setlist.venue.city.name}
                </span>

                {addedStubs[setlist.id] ? (
                  <button
                    onClick={() => handleRemoveConcert(setlist.id)}
                    className="px-3.5 py-1.5 rounded-md border border-brand-error bg-transparent text-brand-error cursor-pointer"
                  >
                    Remove
                  </button>
                ) : loadingSetlistId === setlist.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <button
                    onClick={() => handleCreateConcert(setlist.id)}
                    className="px-3.5 py-1.5 rounded-md bg-brand-gold font-bold cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>

          {setlists.length === 0 && !setlistError && (
            <p className="text-gray-500 mt-4">
              No shows found for this filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AddConcertPage;
