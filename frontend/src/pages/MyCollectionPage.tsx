import { useState, useEffect } from "react";

interface TicketStub {
  id: number;
  design_seed: string | null;
}

interface Concert {
  id: number;
  artist_name: string;
  venue_name: string;
  city: string;
  date: string;
  genre_tags: string[];
  ticket_stub: TicketStub | null;
}

function MyCollectionPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [concertToRemove, setConcertToRemove] = useState<{
    stubId: number;
    concertId: number;
  } | null>(null);

  const handleGenerateStub = (stubId: number) => {
    const token = localStorage.getItem("token");

    fetch(
      `${import.meta.env.VITE_API_URL}/api/ticket-stubs/${stubId}/generate/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        setConcerts((previous) =>
          previous.map((concert) =>
            concert.ticket_stub?.id === stubId
              ? { ...concert, ticket_stub: data }
              : concert,
          ),
        );
      });
  };

  const handleRemoveConcert = (stubId: number, concertId: number) => {
    setConcertToRemove({ stubId, concertId });
  };

  const confirmRemove = () => {
    if (!concertToRemove) return;

    const token = localStorage.getItem("token");

    fetch(
      `${import.meta.env.VITE_API_URL}/api/ticket-stubs/${concertToRemove.stubId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    ).then(() => {
      setConcerts((previous) =>
        previous.filter((concert) => concert.id !== concertToRemove.concertId),
      );
      setConcertToRemove(null);
    });
  };

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
    <div className="min-h-[calc(100vh-88px)] bg-brand-bg text-white p-10 pb-20">
      <h1 className="text-3xl font-bold mb-6 font-brand-mono">My Collection</h1>

      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
      >
        {concerts.map((concert) => (
          <div
            key={concert.id}
            className="bg-brand-card rounded-xl overflow-hidden relative group"
          >
            {concert.ticket_stub?.design_seed ? (
              <>
                <div className="h-36 bg-emerald-400"></div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm mb-1">
                    {concert.genre_tags[0]}
                  </p>
                  <h3 className="font-bold text-lg">{concert.artist_name}</h3>
                  <p className="text-gray-400">{concert.venue_name}</p>
                  <p className="text-gray-400 text-sm">
                    {concert.city} — {concert.date}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleRemoveConcert(concert.ticket_stub!.id, concert.id)
                  }
                  className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 text-brand-error text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Remove
                </button>
              </>
            ) : (
              <div className="border-2 border-dashed border-brand-gold rounded-xl m-1 p-5 text-center min-h-70 flex flex-col justify-center gap-3">
                <div>
                  <p className="font-bold">{concert.artist_name}</p>
                  <p className="text-gray-400 text-sm">{concert.venue_name}</p>
                  <p className="text-gray-400 text-sm">
                    {concert.city} — {concert.date}
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateStub(concert.ticket_stub!.id)}
                  className="px-3 py-2 rounded-md bg-brand-gold font-bold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Generate Stub
                </button>
                <button
                  onClick={() =>
                    handleRemoveConcert(concert.ticket_stub!.id, concert.id)
                  }
                  className="text-brand-error text-sm cursor-pointer hover:opacity-80 transition-opacity"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {concertToRemove && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-brand-card p-6 rounded-xl w-80 text-center">
            <p className="mb-5">Remove this concert from your collection?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded-md bg-brand-error font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Remove
              </button>
              <button
                onClick={() => setConcertToRemove(null)}
                className="px-4 py-2 rounded-md border border-gray-700 cursor-pointer hover:border-brand-gold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCollectionPage;
