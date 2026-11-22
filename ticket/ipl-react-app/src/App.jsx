import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MatchCard from "./components/MatchCard";
import { matchesData } from "./data/matches";
import "./App.css";

function App() {
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const filteredMatches =
    selectedTeam === "all"
      ? matchesData
      : matchesData.filter((m) => m.teams.includes(selectedTeam));

  return (
    <>
      <Navbar />
      <Hero tagline="Experience The Stadium Energy Live!" />

      <main>
        <section id="matches">
          <h2>Match Schedule</h2>

          <div className="filter-bar">
            <label htmlFor="team-filter">
              <strong>Filter by Team:</strong>
            </label>
            <select
              id="team-filter"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">All Teams</option>
              <option value="CSK">Chennai Super Kings (CSK)</option>
              <option value="MI">Mumbai Indians (MI)</option>
              <option value="RCB">Royal Challengers Bengaluru (RCB)</option>
              <option value="KKR">Kolkata Knight Riders (KKR)</option>
              <option value="SRH">Sunrisers Hyderabad (SRH)</option>
            </select>
          </div>

          <div className="match-grid">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSelectMatch={(chosen) => setSelectedMatch(chosen)}
              />
            ))}
          </div>
        </section>

        {selectedMatch && (
          <section id="book-ticket">
            <h2>Selected Match for Booking</h2>
            <p>
              <strong>{selectedMatch.matchNo}:</strong> {selectedMatch.teams} at{" "}
              {selectedMatch.venue} ({selectedMatch.date})
            </p>
            <p style={{ marginTop: "0.5rem" }}>
              <strong>Available Tiers:</strong> {selectedMatch.prices}
            </p>
          </section>
        )}
      </main>
    </>
  );
}

export default App;