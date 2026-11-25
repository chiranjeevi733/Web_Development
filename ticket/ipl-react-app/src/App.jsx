import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MatchCard from "./components/MatchCard";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState("all");

  // Booking form state
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [standCategory, setStandCategory] = useState("General");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Fetch matches and recent bookings from Supabase
  async function fetchData() {
    const { data: matchesData, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .order("id", { ascending: true });

    if (matchError) {
      console.error("Error fetching matches:", matchError.message);
    } else if (matchesData) {
      setMatches(matchesData);
      setSelectedMatch((prev) =>
        prev ? matchesData.find((m) => m.id === prev.id) || matchesData[0] : matchesData[0] || null
      );
    }

    const { data: bookingsData, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!bookingError && bookingsData) {
      setBookings(bookingsData);
    }

    setLoading(false);
  }

  // 2. Load initial data + subscribe to Supabase Realtime changes
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("ipl-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate unit price and total
  function getUnitPrice() {
    if (!selectedMatch) return 0;
    if (standCategory === "Premium") return selectedMatch.premium_price;
    if (standCategory === "VIP") return selectedMatch.vip_price;
    return selectedMatch.general_price;
  }

  const unitPrice = getUnitPrice();
  const totalAmount = unitPrice * quantity;

  // 3. Handle Booking: .insert() into bookings + .update().eq() on matches
  async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!selectedMatch) return;

    if (quantity > selectedMatch.available_seats) {
      setStatusMessage(`Only ${selectedMatch.available_seats} seats left for this match.`);
      return;
    }

    setSubmitting(true);
    setStatusMessage("");

    const matchLabel = `${selectedMatch.match_no}: ${selectedMatch.teams}`;

    // Insert new booking record
    const { error: insertError } = await supabase.from("bookings").insert([
      {
        match_id: selectedMatch.id,
        match_name: matchLabel,
        stand_category: standCategory,
        quantity: Number(quantity),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        total_amount: totalAmount,
      },
    ]);

    if (insertError) {
      setStatusMessage(`Booking failed: ${insertError.message}`);
      setSubmitting(false);
      return;
    }

    // Decrement available_seats in matches table
    const updatedSeats = selectedMatch.available_seats - Number(quantity);
    const { error: updateError } = await supabase
      .from("matches")
      .update({ available_seats: updatedSeats })
      .eq("id", selectedMatch.id);

    if (updateError) {
      setStatusMessage(`Booked, but seat count update failed: ${updateError.message}`);
    } else {
      setStatusMessage(
        `Booking confirmed for ${matchLabel} (${quantity}x ${standCategory} - ₹${totalAmount.toLocaleString("en-IN")})!`
      );
      setCustomerName("");
      setCustomerEmail("");
      setQuantity(1);
      await fetchData();
    }

    setSubmitting(false);
  }

  const filteredMatches =
    selectedTeam === "all"
      ? matches
      : matches.filter((m) => m.teams.includes(selectedTeam));

  return (
    <>
      <Navbar />
      <Hero tagline="Experience The Stadium Energy Live!" />

      <main>
        {/* Live Match Schedule Section */}
        <section id="matches">
          <h2>Match Schedule (Live Supabase Data)</h2>

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

          {loading ? (
            <p>Loading matches from Supabase...</p>
          ) : (
            <div className="match-grid">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelectMatch={(chosen) => {
                    setSelectedMatch(chosen);
                    document.getElementById("book-ticket")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Live Booking Form + Summary */}
        <section id="book-ticket">
          <h2>Book Your Ticket</h2>
          <div className="booking-container">
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="match-select">Select Match</label>
                <select
                  id="match-select"
                  value={selectedMatch?.id || ""}
                  onChange={(e) => {
                    const found = matches.find((m) => m.id === Number(e.target.value));
                    setSelectedMatch(found || null);
                  }}
                  required
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.match_no}: {m.teams} ({m.available_seats} seats left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stand-category">Stand Category</label>
                <select
                  id="stand-category"
                  value={standCategory}
                  onChange={(e) => setStandCategory(e.target.value)}
                >
                  <option value="General">General Stand</option>
                  <option value="Premium">Premium Stand</option>
                  <option value="VIP">VIP Hospitality Box</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ticket-qty">Number of Tickets</label>
                <input
                  type="number"
                  id="ticket-qty"
                  min="1"
                  max={selectedMatch ? Math.min(6, selectedMatch.available_seats) : 6}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-name">Full Name</label>
                <input
                  type="text"
                  id="customer-name"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-email">Email Address</label>
                <input
                  type="email"
                  id="customer-email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>

              {statusMessage && (
                <p style={{ marginTop: "1rem", fontWeight: 700, color: "#0b1c48" }}>
                  {statusMessage}
                </p>
              )}
            </form>

            {/* Live Summary Card */}
            <aside className="summary-card" aria-label="Booking Summary">
              <h3>Booking Summary</h3>
              <div className="summary-item">
                <span>Match:</span>
                <strong>
                  {selectedMatch ? `${selectedMatch.match_no}: ${selectedMatch.teams}` : "None"}
                </strong>
              </div>
              <div className="summary-item">
                <span>Stand:</span>
                <strong>{standCategory}</strong>
              </div>
              <div className="summary-item">
                <span>Ticket Price:</span>
                <strong>₹{unitPrice.toLocaleString("en-IN")}</strong>
              </div>
              <div className="summary-item">
                <span>Quantity:</span>
                <strong>{quantity}</strong>
              </div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </aside>
          </div>
        </section>

        {/* Live Bookings Table from PostgreSQL */}
        <section id="my-bookings">
          <h2>My Ticket Bookings (PostgreSQL Live)</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Match</th>
                  <th>Stand</th>
                  <th>Qty</th>
                  <th>Attendee</th>
                  <th>Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "#64748b" }}>
                      No bookings yet. Book a ticket above to insert into Supabase!
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>{b.match_name}</td>
                      <td>{b.stand_category}</td>
                      <td>{b.quantity}</td>
                      <td>{b.customer_name}</td>
                      <td>₹{b.total_amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;