/* HALDEN – Kontaktformular mit Validierung */
(function () {
  "use strict";

  // Versand-Einstellungen:
  // FORM_ENDPOINT leer  → das E-Mail-Programm öffnet sich mit fertig ausgefüllter Nachricht an MAIL_TO.
  // FORM_ENDPOINT gesetzt (z. B. "https://formspree.io/f/abcdwxyz") → Nachricht wird direkt verschickt.
  var FORM_ENDPOINT = "";
  var MAIL_TO = "hallo@halden-uhren.de";

  var wrapper = document.querySelector(".form");
  var form = document.getElementById("contact-form");
  if (!form) return;
  var errorBox = document.getElementById("form-error");
  var successText = document.getElementById("success-text");
  var defaultSuccess = successText ? successText.textContent : "";

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
    errorBox.hidden = true;

    if (!FORM_ENDPOINT) {
      window.location.href = buildMailto();
      showSuccess("Ihr E-Mail-Programm wurde mit Ihrer Nachricht geöffnet. Bitte klicken Sie dort noch auf „Senden“ – wir melden uns dann innerhalb eines Werktags.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Wird gesendet …";

    fetch(FORM_ENDPOINT, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        showSuccess();
      })
      .catch(function () {
        errorBox.hidden = false;
        resetButton();
      });
  });

  function buildMailto() {
    var el = form.elements;
    var topic = el.betreff.options[el.betreff.selectedIndex].text;
    var body = el.nachricht.value.trim() + "\n\n—\n" + el.name.value.trim() + "\n" + el.email.value.trim() +
      (el.telefon.value.trim() ? "\n" + el.telefon.value.trim() : "");
    return "mailto:" + MAIL_TO +
      "?subject=" + encodeURIComponent("Anfrage: " + topic) +
      "&body=" + encodeURIComponent(body);
  }

  function showSuccess(text) {
    var name = form.elements.name.value.trim().split(" ")[0];
    var target = document.getElementById("success-name");
    if (target) target.textContent = name;
    var p = document.getElementById("success-text");
    if (p) p.textContent = text || defaultSuccess;
    wrapper.classList.add("sent");
    wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetButton() {
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = false;
    btn.textContent = "Nachricht senden";
  }

  var again = document.getElementById("send-again");
  if (again) {
    again.addEventListener("click", function () {
      form.reset();
      resetButton();
      wrapper.classList.remove("sent");
    });
  }
})();
