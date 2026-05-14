// Cleopatra & Partners — interactivity
// - Smooth scroll for hash links
// - Services dropdown
// - Scroll-reveal animations (IntersectionObserver)
// - Async contact form submit (Formspree/Web3Forms compatible)
//   with a graceful mailto fallback if no endpoint is configured.

(function () {
  const FALLBACK_EMAIL = "rivhacleopatra@gmail.com";

  // ---- Footer year ----------------------------------------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- Smooth scroll for in-page anchors -----------------------------------
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

  // ---- Services dropdown ----------------------------------------------------
  document.querySelectorAll(".dropdown-btn").forEach((btn) => {
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

  // ---- Service-row active state --------------------------------------------
  const serviceRows = document.querySelectorAll(".svc-row");
  serviceRows.forEach((row) => {
    row.addEventListener("click", () => {
      serviceRows.forEach((r) => r.classList.remove("active"));
      row.classList.add("active");
    });
  });

  // ---- Sticky header on scroll ---------------------------------------------
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- Scroll-reveal animations --------------------------------------------
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  // ---- Contact form --------------------------------------------------------
  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusEl = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  const setStatus = (msg, kind) => {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.dataset.kind = kind || "";
  };

  const setLoading = (loading) => {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    form.classList.toggle("is-submitting", loading);
  };

  const isEndpointConfigured = (url) =>
    !!url && !/YOUR_FORM_ID/i.test(url) && /^https?:\/\//i.test(url);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    // Honeypot — if a bot fills _gotcha, silently "succeed".
    if (form.querySelector('input[name="_gotcha"]').value) {
      setStatus("Thank you. We'll be in touch soon.", "success");
      form.reset();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const endpoint = form.dataset.endpoint;

    // No endpoint yet — fall back to opening the user's mail client so
    // the website still "works" before Formspree is wired up.
    if (!isEndpointConfigured(endpoint)) {
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const phone = (data.get("phone") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      const body =
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        (phone ? `Phone: ${phone}\n` : "") +
        `\n${message}\n`;

      const mailto =
        `mailto:${FALLBACK_EMAIL}` +
        `?subject=${encodeURIComponent("Consultation request — " + (name || "website visitor"))}` +
        `&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
      setStatus(
        "Opening your email app… If nothing happens, email us directly at " + FALLBACK_EMAIL + ".",
        "info"
      );
      return;
    }

    setLoading(true);
    setStatus("Sending your message…", "info");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus(
          "Thank you. Your consultation request has been sent — we'll be in touch shortly.",
          "success"
        );
        form.reset();
      } else {
        let detail = "";
        try {
          const json = await res.json();
          if (json && json.errors && json.errors.length) {
            detail = " " + json.errors.map((er) => er.message).join(", ");
          }
        } catch (_) {}
        setStatus(
          "Sorry — we couldn't send your message right now." + detail +
            " Please email " + FALLBACK_EMAIL + " directly.",
          "error"
        );
      }
    } catch (err) {
      setStatus(
        "Network problem sending your message. Please check your connection or email " +
          FALLBACK_EMAIL + " directly.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
