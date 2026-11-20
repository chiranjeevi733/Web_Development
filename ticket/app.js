/**
 * IPL 2026 Ticket Booking - User Interaction & DOM Manipulation
 */

// 1. Reusable Toast Notification Function
function showToast(message, type = "info") {
    // Remove any existing toast before showing a new one
    const existingToast = document.getElementById("ipl-toast");
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element dynamically
    const toast = document.createElement("div");
    toast.id = "ipl-toast";
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger slide-in animation on next animation frame
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 2. Initialize Event Listeners after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const bookingSection = document.getElementById("book-ticket");
    const matchSelect = document.getElementById("match-select");
    const summaryMatch = document.getElementById("summary-match");

    // Select all "Book" buttons inside the Match Schedule table
    const scheduleBookButtons = document.querySelectorAll("#matches tbody a.btn");

    scheduleBookButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            // Prevent default instant anchor jump or external page redirect
            event.preventDefault();

            // Extract match details from the clicked table row
            const row = button.closest("tr");
            const matchNo = row.cells[0].textContent.trim();
            const teams = row.cells[1].textContent.trim();
            const matchLabel = `${matchNo}: ${teams}`;

            // Smoothly scroll to the Ticket Booking Form section
            if (bookingSection) {
                bookingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            // Pre-select the clicked match in the booking form & summary card
            if (matchSelect) {
                Array.from(matchSelect.options).forEach((option) => {
                    if (option.value.includes(teams) || option.text.includes(teams)) {
                        matchSelect.value = option.value;
                    }
                });
            }
            if (summaryMatch) {
                summaryMatch.textContent = matchLabel;
            }

            // Display confirmation toast notification
            showToast(`Selected ${matchLabel}. Complete your ticket details below!`, "success");
        });
    });

    // Smooth scroll for Hero "Book Ticket" button
    const heroBookBtn = document.querySelector('.hero-actions a[href*="book"]');
    if (heroBookBtn && bookingSection) {
        heroBookBtn.addEventListener("click", (event) => {
            event.preventDefault();
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast("Choose your match and stand category below.", "info");
        });
    }
});