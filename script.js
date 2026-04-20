// Smooth scrolling + basic form handling for the static site.
(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth-scroll for hash links (works even if browser doesn't respect CSS scroll-behavior).
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", href);
  });

  // Dropdown (Services)
  const dropdownButtons = document.querySelectorAll(".dropdown-btn");
  dropdownButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const dropdown = btn.closest(".nav-dropdown");
      if (!dropdown) return;
      const isOpen = dropdown.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  document.addEventListener("click", (e) => {
    const openDropdown = document.querySelector(".nav-dropdown.open");
    if (!openDropdown) return;

    const menu = openDropdown.querySelector(".dropdown-menu");
    const clickedInsideOpen = openDropdown.contains(e.target);
    const clickedMenuItem = !!(menu && menu.contains(e.target));

    // Close when clicking anywhere else OR selecting a menu item.
    if (!clickedInsideOpen || clickedMenuItem) {
      openDropdown.classList.remove("open");
      const btn = openDropdown.querySelector(".dropdown-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openDropdown = document.querySelector(".nav-dropdown.open");
    if (!openDropdown) return;
    openDropdown.classList.remove("open");
    const btn = openDropdown.querySelector(".dropdown-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });

  // Service click handling
  const serviceRows = document.querySelectorAll(".svc-row");
  serviceRows.forEach((row) => {
    row.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default scroll behavior
      // Remove active class from all services
      serviceRows.forEach((r) => r.classList.remove("active"));
      // Add active class to clicked service
      row.classList.add("active");
    });
  });

  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    // Demo-only: show a confirmation message.
    // Replace this with a real backend endpoint when you’re ready.
    alert(
      "Thanks" +
        (name ? ", " + name : "") +
        "! Your consultation request is ready to be sent.\n\nEmail: " +
        (email || "(not provided)") +
        "\nMessage: " +
        (message ? message.slice(0, 120) + (message.length > 120 ? "…" : "") : "(empty)") +
        "\n\n(Preview form: no email is sent yet.)"
    );
    form.reset();
  });
})();

