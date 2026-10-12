/* Nepali Number to Words — converter engine (original implementation) */
(function () {
  "use strict";

  // Standard Nepali number words, 0–99
  var NP = [
    "सुन्य", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ",
    "दस", "एघार", "बाह्र", "तेह्र", "चौध", "पन्ध्र", "सोह्र", "सत्र",
    "अठार", "उन्नाइस", "बीस", "एक्काइस", "बाइस", "तेइस", "चौबीस",
    "पच्चीस", "छब्बीस", "सत्ताइस", "अट्ठाइस", "उनन्तीस", "तीस",
    "एक्तीस", "बत्तीस", "तेत्तीस", "चौंतीस", "पैंतीस", "छत्तीस",
    "सैंतीस", "अठतीस", "उनन्चालीस", "चालीस", "एकचालीस", "बयालीस",
    "त्रियालीस", "चवालीस", "पैंतालीस", "छयालीस", "सच्चालीस",
    "अठचालीस", "उनन्चास", "पचास", "एकाउन्न", "बाउन्न", "त्रिपन्न",
    "चउन्न", "पचपन्न", "छपन्न", "सन्ताउन्न", "अन्ठाउन्न", "उनन्साठी",
    "साठी", "एकसठ्ठी", "बैसठ्ठी", "त्रिसठ्ठी", "चौंठ्ठी", "पैंसठ्ठी",
    "छयासठ्ठी", "सतसठ्ठी", "अठसठ्ठी", "उनन्सत्तरी", "सत्तरी",
    "एकहत्तर", "बहत्तर", "त्रिहत्तर", "चौरहत्तर", "पचहत्तर",
    "छयहत्तर", "सतहत्तर", "अठहत्तर", "उनासी", "अस्सी", "एकासी",
    "बयासी", "त्रियासी", "चौरासी", "पचासी", "छयासी", "सतासी",
    "अठासी", "उनान्नब्बे", "नब्बे", "एकान्नब्बे", "बयान्नब्बे",
    "त्रियान्नब्बे", "चौरान्नब्बे", "पचान्नब्बे", "छयान्नब्बे",
    "सन्तानब्बे", "अन्ठान्नब्बे", "उनान्सय"
  ];

  // English words 0–99
  var EN_ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety"];

  // Nepali-system scale units, largest → smallest
  var NP_UNITS = [
    { v: 1e11, np: "खरब", en: "Kharab", pl: true },
    { v: 1e9, np: "अरब", en: "Arab", pl: true },
    { v: 1e7, np: "करोड", en: "Crore", pl: true },
    { v: 1e5, np: "लाख", en: "Lakh", pl: true },
    { v: 1e3, np: "हजार", en: "Thousand", pl: false }
  ];

  function enBelow100(n) {
    if (n < 20) return EN_ONES[n];
    var t = EN_TENS[Math.floor(n / 10)];
    return n % 10 ? t + " " + EN_ONES[n % 10] : t;
  }

  function enBelow1000(n) {
    var h = Math.floor(n / 100), r = n % 100, out = "";
    if (h > 0) out += EN_ONES[h] + " Hundred";
    if (r > 0) out += (out ? " and " : "") + enBelow100(r);
    return out;
  }

  function npBelow1000(n) {
    var h = Math.floor(n / 100), r = n % 100, out = "";
    if (h > 0) out += NP[h] + " सय";
    if (r > 0) out += (out ? " " : "") + NP[r];
    return out;
  }

  function convertInteger(numStr) {
    var n = parseInt(numStr, 10);
    if (n === 0) return { np: "सुन्य", en: "Zero" };
    var npParts = [], enParts = [], rest = n;
    for (var i = 0; i < NP_UNITS.length; i++) {
      var u = NP_UNITS[i];
      var q = Math.floor(rest / u.v);
      if (q > 0) {
        npParts.push(NP[q] + " " + u.np);
        enParts.push(enBelow100(q) + " " + u.en + (u.pl && q !== 1 ? "s" : ""));
        rest = rest % u.v;
      }
    }
    if (rest > 0) {
      npParts.push(npBelow1000(rest));
      enParts.push(enBelow1000(rest));
    }
    return { np: npParts.join(" "), en: enParts.join(" ") };
  }

  function convert(raw) {
    var s = String(raw == null ? "" : raw).replace(/[\s,]/g, "");
    if (s === "") return { ok: false, empty: true };
    if (!/^\d{1,13}(\.\d{1,2})?$/.test(s)) {
      if (/^\d+$/.test(s.split(".")[0]) && s.split(".")[0].length > 13)
        return { ok: false, error: "Number is too large — maximum 13 digits (up to खरब / Kharab) is supported." };
      return { ok: false, error: "Please enter a valid number (digits with up to 2 decimal places)." };
    }
    var parts = s.split("."), intPart = parts[0].replace(/^0+(?=\d)/, "");
    var c = convertInteger(intPart === "" ? "0" : intPart);
    var np = c.np + " रुपैंया";
    var en = c.en + (c.en === "Zero" ? "" : " Rupees");
    if (parts[1] !== undefined) {
      var frac = (parts[1] + "0").slice(0, 2);
      var f = parseInt(frac, 10);
      if (f > 0) {
        np += ", " + NP[f] + " पैसा";
        en += " and " + enBelow100(f) + " Paisa";
      }
    }
    return { ok: true, np: np, en: en };
  }

  // ---- UI wiring ----
  var input = document.getElementById("numberInput");
  var npOut = document.getElementById("resultNepali");
  var enOut = document.getElementById("resultEnglish");
  var errBox = document.getElementById("errorBox");
  var form = document.getElementById("converterForm");

  function showError(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
    npOut.value = "";
    enOut.value = "";
  }

  function render() {
    var r = convert(input.value);
    errBox.hidden = true;
    if (r.empty) { npOut.value = ""; enOut.value = ""; return; }
    if (!r.ok) { showError(r.error); return; }
    npOut.value = r.np;
    enOut.value = r.en;
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
  input.addEventListener("input", render);

  document.querySelectorAll("[data-sample]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      input.value = chip.getAttribute("data-sample");
      render();
      input.focus();
    });
  });

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-copy"));
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "Copied ✓";
        setTimeout(function () { btn.textContent = old; }, 1400);
      };
      var legacyCopy = function () {
        var ta = document.createElement("textarea");
        ta.value = target.value || target.textContent;
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(target.value || target.textContent).then(done, legacyCopy);
      } else {
        legacyCopy();
      }
    });
  });

  // ---- PWA: service worker registration ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  // ---- PWA install prompt ----
  var installBtn = document.getElementById("installBtn");
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
  });
  window.addEventListener("appinstalled", function () { installBtn.hidden = true; });
})();
