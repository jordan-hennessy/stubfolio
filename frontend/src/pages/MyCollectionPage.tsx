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
          <div
            key={concert.id}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              overflow: "hidden",
              color: "white",
            }}
          >
            {concert.ticket_stub?.design_seed ? (
              <>
                <div
                  style={{ backgroundColor: "#32ffa3", height: "150px" }}
                ></div>
                <p>{concert.genre_tags[0]}</p>
                <h3>{concert.artist_name}</h3>
                <p>{concert.venue_name}</p>
                <p>
                  {concert.city} — {concert.date}
                </p>
              </>
            ) : (
              <div
                style={{
                  border: "2px dashed #e8c98a",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <p>{concert.artist_name}</p>
                <button
                  onClick={() => handleGenerateStub(concert.ticket_stub!.id)}
                >
                  Generate Stub
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCollectionPage;
