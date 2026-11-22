/**
 * IPL 2026 Ticket Booking - Responsive Layout & Interactive Controls
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

// 2. Initialize Interactive Features on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    /* ---------------------------------------------------------
       A. Mobile Hamburger Menu Toggle
       --------------------------------------------------------- */
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");
            menuToggle.classList.toggle("open", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                menuToggle.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------------------------------------------------------
       B. Filter Match Cards by Team & Toggle Grid / List View
       --------------------------------------------------------- */
    const teamFilter = document.getElementById("team-filter");
    const matchContainer = document.getElementById("match-cards-container");
    const matchCards = document.querySelectorAll(".match-card");
    const gridViewBtn = document.getElementById("grid-view-btn");
    const listViewBtn = document.getElementById("list-view-btn");

    if (teamFilter) {
        teamFilter.addEventListener("change", () => {
            const selectedTeam = teamFilter.value;
            let visibleCount = 0;

            matchCards.forEach((card) => {
                const teams = card.dataset.teams || "";
                if (selectedTeam === "all" || teams.includes(selectedTeam)) {
                    card.style.display = "flex";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            showToast(
                selectedTeam === "all"
                    ? "Showing all IPL 2026 matches."
                    : `Filtered: ${visibleCount} match(es) featuring ${selectedTeam}.`,
                "info"
            );
        });
    }

    if (gridViewBtn && listViewBtn && matchContainer) {
        gridViewBtn.addEventListener("click", () => {
            matchContainer.classList.remove("list-view");
            gridViewBtn.classList.add("active");
            listViewBtn.classList.remove("active");
            showToast("Switched to Grid View.", "info");
        });

        listViewBtn.addEventListener("click", () => {
            matchContainer.classList.add("list-view");
            listViewBtn.classList.add("active");
            gridViewBtn.classList.remove("active");
            showToast("Switched to List View.", "info");
        });
    }

    /* ---------------------------------------------------------
       C. Live Booking Summary Calculation
       --------------------------------------------------------- */
    const bookingSection = document.getElementById("book-ticket");
    const matchSelect = document.getElementById("match-select");
    const standSelect = document.getElementById("stand-category");
    const qtyInput = document.getElementById("ticket-qty");

    const summaryMatch = document.getElementById("summary-match");
    const summaryStand = document.getElementById("summary-stand");
    const summaryPrice = document.getElementById("summary-price");
    const summaryQty = document.getElementById("summary-qty");
    const summaryTotal = document.getElementById("summary-total");

    function formatINR(amount) {
        return `₹${amount.toLocaleString("en-IN")}`;
    }

    function updateBookingSummary(triggerToast = true) {
        if (!matchSelect || !standSelect || !qtyInput) return;

        const selectedMatchOption = matchSelect.options[matchSelect.selectedIndex];
        const matchValue = matchSelect.value;
        const standValue = standSelect.value;

        let quantity = parseInt(qtyInput.value, 10);
        if (isNaN(quantity) || quantity < 1) quantity = 1;
        if (quantity > 6) {
            quantity = 6;
            qtyInput.value = 6;
        }

        let unitPrice = 0;
        if (standValue === "General") {
            unitPrice = Number(selectedMatchOption.dataset.general) || 1500;
        } else if (standValue === "Premium") {
            unitPrice = Number(selectedMatchOption.dataset.premium) || 3500;
        } else if (standValue === "VIP") {
            unitPrice = Number(selectedMatchOption.dataset.vip) || 8000;
        }

        const totalAmount = unitPrice * quantity;

        summaryMatch.textContent = matchValue || "Not Selected";
        summaryStand.textContent = standValue
            ? standSelect.options[standSelect.selectedIndex].text
            : "Not Selected";
        summaryPrice.textContent = formatINR(unitPrice);
        summaryQty.textContent = quantity;
        summaryTotal.textContent = formatINR(totalAmount);

        if (triggerToast) {
            showToast(
                `Summary updated: ${quantity}x ${standValue || "Ticket"} (${formatINR(totalAmount)})`,
                "info"
            );
        }
    }

    if (matchSelect) matchSelect.addEventListener("change", () => updateBookingSummary(true));
    if (standSelect) standSelect.addEventListener("change", () => updateBookingSummary(true));
    if (qtyInput) {
        qtyInput.addEventListener("change", () => updateBookingSummary(true));
        qtyInput.addEventListener("input", () => updateBookingSummary(false));
    }

    /* ---------------------------------------------------------
       D. Match Card "Book" Buttons -> Smooth Scroll & Pre-select
       --------------------------------------------------------- */
    const scheduleBookButtons = document.querySelectorAll(".schedule-book-btn");

    scheduleBookButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            const card = button.closest(".match-card");
            const matchLabel = card ? card.dataset.matchValue : "";

            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            if (matchSelect && matchLabel) {
                matchSelect.value = matchLabel;
            }

            if (standSelect && !standSelect.value) {
                standSelect.value = "General";
            }

            updateBookingSummary(false);
            showToast(`Selected ${matchLabel}. Summary updated!`, "success");
        });
    });

    const heroBookBtn = document.querySelector('.hero-actions a[href="#book-ticket"]');
    if (heroBookBtn && bookingSection) {
        heroBookBtn.addEventListener("click", (event) => {
            event.preventDefault();
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast("Select a match, stand, and quantity below.", "info");
        });
    }
});