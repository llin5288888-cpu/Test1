/* HALDEN – allgemeine Funktionen (Navigation, Animationen, Cookie-Hinweis) */
(function () {
  "use strict";

  // Mobile Navigation
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Aktuelles Jahr im Footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Einblend-Animation beim Scrollen
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("visible"); });
  }

  // Newsletter (Demo ohne Server)
  document.querySelectorAll(".newsletter").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      if (!input.checkValidity()) { input.reportValidity(); return; }
      form.innerHTML = "<p style='margin:0;color:#fff'>Danke! Bitte bestätigen Sie Ihre Anmeldung per E-Mail.</p>";
    });
  });

  // Cookie-Hinweis
  var KEY = "halden-cookie-consent";
  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* Speicher nicht verfügbar */ }
  }
  var banner = document.querySelector(".cookie-banner");
  if (banner) {
    if (!getConsent()) banner.classList.add("show");
    banner.addEventListener("click", function (e) {
      var choice = e.target.getAttribute("data-consent");
      if (!choice) return;
      setConsent(choice);
      banner.classList.remove("show");
    });
    document.querySelectorAll("[data-cookie-settings]").forEach(function (btn) {
      btn.addEventListener("click", function () { banner.classList.add("show"); });
    });
  }
})();
