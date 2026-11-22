function MatchCard({ match, onSelectMatch }) {
  const { matchNo, teams, date, venue, prices } = match;

  return (
    <article className="match-card">
      <div className="match-card-header">
        <span className="match-badge">{matchNo}</span>
        <span className="match-date">{date}</span>
      </div>
      <h3 className="match-teams">{teams}</h3>
      <p className="match-venue">{venue}</p>
      <p className="match-prices">
        <strong>Tickets:</strong> {prices}
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => onSelectMatch(match)}
      >
        Book
      </button>
    </article>
  );
}

export default MatchCard;