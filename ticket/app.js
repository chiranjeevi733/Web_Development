/**
 * IPL 2026 Ticket Booking - User Interaction & Live Booking Summary
 */

// 1. Reusable Toast Notification Function
function showToast(message, type = "info") {
    const existingToast = document.getElementById("ipl-toast");
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "ipl-toast";
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 2. DOM Selection & Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Section & Form Selectors
    const bookingSection = document.getElementById("book-ticket");
    const matchSelect = document.getElementById("match-select");
    const standSelect = document.getElementById("stand-category");
    const qtyInput = document.getElementById("ticket-qty");

    // Booking Summary Card Selectors
    const summaryMatch = document.getElementById("summary-match");
    const summaryStand = document.getElementById("summary-stand");
    const summaryPrice = document.getElementById("summary-price");
    const summaryQty = document.getElementById("summary-qty");
    const summaryTotal = document.getElementById("summary-total");

    // Helper: Format numbers in Indian Rupee currency format
    function formatINR(amount) {
        return `₹${amount.toLocaleString("en-IN")}`;
    }

    // 3. Live Calculation & Summary Update Function
    function updateBookingSummary(triggerToast = true) {
        if (!matchSelect || !standSelect || !qtyInput) return;

        const selectedMatchOption = matchSelect.options[matchSelect.selectedIndex];
        const matchValue = matchSelect.value;
        const standValue = standSelect.value;

        // Clamp ticket quantity between 1 and 6
        let quantity = parseInt(qtyInput.value, 10);
        if (isNaN(quantity) || quantity < 1) quantity = 1;
        if (quantity > 6) {
            quantity = 6;
            qtyInput.value = 6;
        }

        // Determine unit ticket price based on selected match and stand
        let unitPrice = 0;
        if (standValue === "General") {
            unitPrice = Number(selectedMatchOption.dataset.general) || 1500;
        } else if (standValue === "Premium") {
            unitPrice = Number(selectedMatchOption.dataset.premium) || 3500;
        } else if (standValue === "VIP") {
            unitPrice = Number(selectedMatchOption.dataset.vip) || 8000;
        }

        const totalAmount = unitPrice * quantity;

        // Update DOM elements inside Booking Summary Card
        summaryMatch.textContent = matchValue || "Not Selected";
        summaryStand.textContent = standValue
            ? standSelect.options[standSelect.selectedIndex].text
            : "Not Selected";
        summaryPrice.textContent = formatINR(unitPrice);
        summaryQty.textContent = quantity;
        summaryTotal.textContent = formatINR(totalAmount);

        // Confirm update with toast notification
        if (triggerToast) {
            showToast(
                `Summary updated: ${quantity}x ${standValue || "Ticket"} (${formatINR(totalAmount)})`,
                "info"
            );
        }
    }

    // Attach 'change' & 'input' listeners to form controls
    if (matchSelect) {
        matchSelect.addEventListener("change", () => updateBookingSummary(true));
    }
    if (standSelect) {
        standSelect.addEventListener("change", () => updateBookingSummary(true));
    }
    if (qtyInput) {
        qtyInput.addEventListener("change", () => updateBookingSummary(true));
        qtyInput.addEventListener("input", () => updateBookingSummary(false));
    }

    // 4. Match Schedule "Book" Buttons -> Smooth scroll + pre-select + live update
    const scheduleBookButtons = document.querySelectorAll(".schedule-book-btn");

    scheduleBookButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            const row = button.closest("tr");
            const matchNo = row.cells[0].textContent.trim();
            const teams = row.cells[1].textContent.trim();
            const matchLabel = `${matchNo}: ${teams}`;

            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            if (matchSelect) {
                Array.from(matchSelect.options).forEach((option) => {
                    if (option.value.includes(teams) || option.text.includes(teams)) {
                        matchSelect.value = option.value;
                    }
                });
            }

            // Default to General stand if no stand is selected yet
            if (standSelect && !standSelect.value) {
                standSelect.value = "General";
            }

            updateBookingSummary(false);
            showToast(`Selected ${matchLabel}. Summary updated!`, "success");
        });
    });

    // Hero "Book Ticket" Button -> Smooth scroll
    const heroBookBtn = document.querySelector('.hero-actions a[href="#book-ticket"]');
    if (heroBookBtn && bookingSection) {
        heroBookBtn.addEventListener("click", (event) => {
            event.preventDefault();
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast("Select a match, stand, and quantity below.", "info");
        });
    }
});