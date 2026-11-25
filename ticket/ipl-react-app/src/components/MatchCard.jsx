function MatchCard({ match, onSelectMatch }) {
  const { match_no, teams, match_date, venue, prices, available_seats } = match;
  const isSoldOut = available_seats <= 0;

  return (
    <article className="match-card">
      <div className="match-card-header">
        <span className="match-badge">{match_no}</span>
        <span className="match-date">{match_date}</span>
      </div>
      <h3 className="match-teams">{teams}</h3>
      <p className="match-venue">{venue}</p>
      <p className="match-prices">
        <strong>Tickets:</strong> {prices}
      </p>
      <p className="match-seats">
        <strong>Available Seats:</strong>{" "}
        <span style={{ color: isSoldOut ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
          {isSoldOut ? "Sold Out" : `${available_seats} left`}
        </span>
      </p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={isSoldOut}
        onClick={() => onSelectMatch(match)}
      >
        {isSoldOut ? "Sold Out" : "Book"}
      </button>
    </article>
  );
}

export default MatchCard;