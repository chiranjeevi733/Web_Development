function Hero({ tagline }) {
  return (
    <section className="hero" aria-label="Hero Banner">
      <h1>{tagline}</h1>
      <div className="hero-actions">
        <a href="#matches" className="btn btn-secondary">View Schedule</a>
        <a href="#book-ticket" className="btn btn-primary">Book Ticket</a>
      </div>
    </section>
  );
}

export default Hero;