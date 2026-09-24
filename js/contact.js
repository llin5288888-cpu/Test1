/* HALDEN – Kontaktformular mit Validierung */
(function () {
  "use strict";

  var wrapper = document.querySelector(".form");
  var form = document.getElementById("contact-form");
  if (!form) return;

  // Betreff aus URL übernehmen, z. B. kontakt.html?betreff=beratung
  var params = new URLSearchParams(window.location.search);
  var subject = params.get("betreff");
  if (subject) {
    var select = form.querySelector("#betreff");
    if (select && select.querySelector('option[value="' + subject + '"]')) select.value = subject;
  }

  var rules = {
    name: function (v) { return v.trim().length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    betreff: function (v) { return v !== ""; },
    nachricht: function (v) { return v.trim().length >= 10; },
    datenschutz: function (v, el) { return el.checked; }
  };

  function validate(el) {
    var rule = rules[el.name];
    if (!rule) return true;
    var ok = rule(el.value, el);
    var field = el.closest(".field");
    if (field) field.classList.toggle("invalid", !ok);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  form.addEventListener("input", function (e) {
    var field = e.target.closest(".field");
    if (field && field.classList.contains("invalid")) validate(e.target);
  });
  form.addEventListener("change", function (e) { validate(e.target); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (el && !validate(el) && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Wird gesendet …";

    // Hinweis: Für den echten Versand hier einen Endpunkt (z. B. eigenes Backend
    // oder Formspree) per fetch() ansprechen. Aktuell wird der Versand simuliert.
    setTimeout(function () {
      var name = form.elements.name.value.trim().split(" ")[0];
      var target = document.getElementById("success-name");
      if (target) target.textContent = name;
      wrapper.classList.add("sent");
      wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 700);
  });

  var again = document.getElementById("send-again");
  if (again) {
    again.addEventListener("click", function () {
      form.reset();
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = false;
      btn.textContent = "Nachricht senden";
      wrapper.classList.remove("sent");
    });
  }
})();
