function Navbar() {
  return (
    <header>
      <nav aria-label="Primary Navigation">
        <div className="logo">IPL 2026 Tickets</div>
        <ul className="nav-links">
          <li><a href="#matches">Matches</a></li>
          <li><a href="#book-ticket">Book Ticket</a></li>
          <li><a href="#my-bookings">My Bookings</a></li>
          <li><a href="#guidelines">Guidelines</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;