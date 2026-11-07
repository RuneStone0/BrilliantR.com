/* BrilliantR /pay — hydrates the payment tiles from pay-details.js and the
 * invoice parameters on the link (?amt=..&inv=..). The payment reference
 * is derived from the invoice number, so no third parameter is needed.
 *
 * The QR on each invoice encodes this page with the amount and invoice number,
 * so the payer never types a figure. Everything degrades to plain links.
 */
(function () {
  "use strict";

  var CFG = window.BR_PAY || { methods: {} };
  var params = new URLSearchParams(window.location.search);
  var PREVIEW = params.get("preview") === "1";

  /* ——— Invoice context ——— */
  function parseAmount(raw) {
    if (!raw) return null;
    var n = Number(String(raw).replace(/[^0-9.]/g, ""));
    return isFinite(n) && n > 0 ? n : null;
  }

  var amount = parseAmount(params.get("amt"));
  var invoice = (params.get("inv") || "").trim();

  var currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  var amountText = amount ? currency.format(amount) : "";
  var amountParam = amount ? amount.toFixed(2) : "";

  /* The payment reference is derived from the invoice number alone, so a link
     only ever carries ?amt and ?inv. Numeric invoices are zero-padded to three
     digits, matching how they are written on the PDF. */
  function reference() {
    if (!invoice) return "BrilliantR payment";
    var num = /^\d+$/.test(invoice) ? ("000" + invoice).slice(-3) : invoice;
    return "brilliantr-invoice-" + num;
  }

  (function renderSummary() {
    if (!amount && !invoice) return;
    var wrap = document.getElementById("pay-summary");
    var amtEl = document.getElementById("pay-amount");
    var invEl = document.getElementById("pay-inv-line");
    var refEl = document.getElementById("pay-ref-line");

    if (amount) {
      amtEl.textContent = amountText;
    } else {
      document.querySelector(".pay-summary-label").textContent = "Invoice";
      amtEl.textContent = invoice;
      invEl.hidden = true;
    }
    if (amount && !invoice) invEl.hidden = true;
    if (invoice) {
      invEl.textContent = "Invoice " + invoice;
      if (refEl) {
        refEl.textContent = "Ref " + reference();
        refEl.hidden = false;
      }
    }
    wrap.hidden = false;

    document.title = (amount ? amountText + " — " : "") + "Pay BrilliantR";
  })();

  /* ——— Tile helpers ——— */
  function tile(name) {
    return document.querySelector('.pay-tile[data-method="' + name + '"]');
  }

  function fill(name, value) {
    document.querySelectorAll('[data-fill="' + name + '"]').forEach(function (el) {
      el.textContent = value;
    });
  }

  function placeholder(name, note) {
    var t = tile(name);
    if (!t) return;
    if (!PREVIEW) {
      t.remove();
      return;
    }
    t.classList.add("is-placeholder");
    t.querySelectorAll("a,button").forEach(function (el) {
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("tabindex", "-1");
    });
    var body = t.querySelector(".pay-tile-body");
    if (body && note) body.textContent = note;
  }

  function methodActive(name) {
    var m = CFG.methods && CFG.methods[name];
    return !!(m && m.enabled);
  }

  /* ——— Venmo ——— */
  (function venmo() {
    var m = CFG.methods.venmo;
    if (!methodActive("venmo") || !m.url) {
      return placeholder("venmo", "Venmo is not connected to this page yet.");
    }
    var link = tile("venmo").querySelector('[data-action="external"]');
    var url = new URL(m.url);
    url.searchParams.set("txn", "pay");
    if (amountParam) url.searchParams.set("amount", amountParam);
    url.searchParams.set("note", reference());
    link.href = url.toString();
    fill("venmo-handle", "@" + m.handle);
  })();

  /* ——— PayPal ——— */
  (function paypal() {
    var m = CFG.methods.paypal;
    if (!methodActive("paypal") || (!m.url && !m.handle && !m.email)) {
      return placeholder("paypal", "PayPal is not connected to this page yet.");
    }
    var t = tile("paypal");
    var link = t.querySelector('[data-action="external"]');
    var body = t.querySelector(".pay-tile-body");
    var panel = t.querySelector('[data-panel="paypal"] dl');

    if (m.handle) {
      // paypal.me/<handle> accepts the amount in the path.
      var base = (m.url || "https://www.paypal.com/paypalme/" + encodeURIComponent(m.handle))
        .replace(/\/+$/, "");
      link.href = amountParam ? base + "/" + amountParam + "USD" : base;
      fill("paypal-handle", "paypal.me/" + m.handle);
    } else {
      // No paypal.me handle: the account is reached by email, and the app's
      // scan-to-receive link carries no amount, so the payer types the figure.
      if (m.url) {
        link.href = m.url;
        link.childNodes[0].textContent = "Open PayPal ";
      } else {
        link.remove();
      }
      if (amountText) {
        body.textContent = "Send " + amountText + " in PayPal" +
          (m.email ? " to " + m.email : "") + ", with " + reference() + " in the note.";
      } else if (m.email) {
        body.textContent = "Send the invoice amount in PayPal to " + m.email + ".";
      }
    }

    if (m.email && panel) {
      var row = document.createElement("div");
      row.className = "pay-row";
      var dt = document.createElement("dt");
      dt.textContent = "PayPal email";
      var dd = document.createElement("dd");
      dd.textContent = m.email;
      dd.setAttribute("data-copy", "");
      row.appendChild(dt);
      row.appendChild(dd);
      panel.appendChild(row);
      addCopy(dd);

      // Every panel needs its own control or the content is unreachable.
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "pay-link";
      toggle.setAttribute("data-action", "toggle-details");
      toggle.setAttribute("data-label-open", "Show email");
      toggle.setAttribute("data-label-close", "Hide email");
      toggle.setAttribute("aria-expanded", "false");
      toggle.appendChild(document.createTextNode("Show email "));
      toggle.insertAdjacentHTML("beforeend",
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
      t.querySelector(".pay-tile-foot").appendChild(toggle);
    }
  })();

  /* ——— Wise / bank transfer ——— */
  (function wise() {
    var m = CFG.methods.wise;
    if (!methodActive("wise")) {
      return placeholder("wise", "Bank details are not connected to this page yet.");
    }
    fill("wise-name", m.accountName || "");
    fill("wise-routing", m.routing || "");
    fill("wise-account", m.account || "");
    fill("wise-type", m.accountType || "");
    fill("wise-bank", m.bank || "");

    if (!m.routing && !m.account) {
      return placeholder("wise", "Bank details are not connected to this page yet.");
    }

    if (m.url) {
      // Keep the ACH details available: the Wise link is the fast path, the
      // copyable routing/account numbers are what a bookkeeper asks for.
      var t = tile("wise");
      var foot = t.querySelector(".pay-tile-foot");
      var b = foot.querySelector('[data-action="toggle-details"]');
      var a = document.createElement("a");
      a.className = "pay-link";
      a.href = m.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = "Open Wise " +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
      if (b) foot.insertBefore(a, b);
    }
  })();

  /* ——— Bitcoin ——— */
  (function bitcoin() {
    var m = CFG.methods.bitcoin;
    if (!methodActive("bitcoin")) {
      return placeholder("bitcoin", "Bitcoin is not connected to this page yet.");
    }
    var t = tile("bitcoin");
    var link = t.querySelector('[data-action="btc"]');
    var panel = t.querySelector('[data-panel="bitcoin"] dl');

    function addRow(label, value, stacked) {
      var row = document.createElement("div");
      row.className = "pay-row" + (stacked ? " pay-row--stack" : "");
      var dt = document.createElement("dt");
      dt.textContent = label;
      var dd = document.createElement("dd");
      dd.textContent = value;
      dd.setAttribute("data-copy", "");
      row.appendChild(dt);
      row.appendChild(dd);
      panel.appendChild(row);
      addCopy(dd);
    }

    if (m.lightning) addRow("Lightning", m.lightning, false);
    if (m.address) addRow("On-chain", m.address, true);

    if (m.lightning || m.address) {
      fill("btc-body", "Pay over Lightning for an instant, near-free transfer — or on-chain to the " +
        "address below. The dollar figure holds at the rate when the coins arrive, so tell us once it's sent.");
    }

    // Paying is the primary action; Strike is only a hint for someone with no
    // wallet at all, so it never takes the main button.
    if (m.lightning) {
      link.href = "lightning:" + m.lightning;
      link.textContent = "Pay with Lightning";
    } else {
      var subject = "Lightning invoice request — " + (invoice ? "Invoice " + invoice : "BrilliantR");
      var body = "Please send a Lightning invoice for " + (amountText || "the amount due") +
        (invoice ? " (invoice " + invoice + ")" : "") + ".\n\nThanks!";
      link.href = "mailto:" + (CFG.email || "rune@brilliantr.com") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    }

    if (m.lightning || m.address) {
      // Without a toggle the addresses sit in a panel nobody can open.
      var btcToggle = document.createElement("button");
      btcToggle.type = "button";
      btcToggle.className = "pay-link";
      btcToggle.setAttribute("data-action", "toggle-details");
      btcToggle.setAttribute("data-label-open", "Show addresses");
      btcToggle.setAttribute("data-label-close", "Hide addresses");
      btcToggle.setAttribute("aria-expanded", "false");
      btcToggle.appendChild(document.createTextNode("Show addresses "));
      btcToggle.insertAdjacentHTML("beforeend",
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
      link.parentElement.appendChild(btcToggle);
      if (m.referral) {
        var hint = document.createElement("a");
        hint.className = "pay-link pay-link--hint";
        hint.href = m.referral;
        hint.target = "_blank";
        hint.rel = "noopener noreferrer";
        hint.textContent = "No wallet yet? Strike";
        link.parentElement.appendChild(hint);
      }
    }
  })();

  /* ——— Details toggle ——— */
  function setOpen(btn, open) {
    var t = btn.closest(".pay-tile");
    t.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var label = open
      ? (btn.dataset.labelClose || "Hide details")
      : (btn.dataset.labelOpen || "Show details");
    btn.childNodes[0].textContent = label + " ";
  }

  document.querySelectorAll('[data-action="toggle-details"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      setOpen(btn, !btn.closest(".pay-tile").classList.contains("is-open"));
    });
  });

  /* Deep links like /pay/#bank open the matching panel (used from emails). */
  (function openFromHash() {
    var want = (window.location.hash || "").replace("#", "");
    var map = { bank: "wise", wise: "wise", bitcoin: "bitcoin", btc: "bitcoin", paypal: "paypal" };
    var target = map[want];
    if (!target) return;
    var t = tile(target);
    var btn = t && t.querySelector('[data-action="toggle-details"]');
    if (btn) setOpen(btn, true);
  })();

  /* ——— Copy buttons ——— */
  function addCopy(el) {
    if (!el || el.parentElement.querySelector(".pay-copy")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pay-copy";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var text = el.textContent.trim();
      var done = function () {
        btn.textContent = "Copied";
        btn.classList.add("is-done");
        setTimeout(function () {
          btn.textContent = "Copy";
          btn.classList.remove("is-done");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
    el.parentElement.insertBefore(btn, el.nextSibling);
  }

  function fallback(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-copy]").forEach(addCopy);

  /* ——— Page QR: scan the laptop screen to finish on a phone ——— */
  (function pageQr() {
    var box = document.getElementById("pay-qr");
    var canvas = document.getElementById("pay-qr-canvas");
    if (!box || !canvas || typeof qrcode !== "function") return;

    // Exactly this page, including the amount and invoice number, minus any hash.
    var url = window.location.href.split("#")[0];
    var qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();

    var count = qr.getModuleCount();
    var scale = 12; // ~490px source, sharp on retina and when screenshotted
    var quiet = 4;
    var size = (count + quiet * 2) * scale;
    canvas.width = size;
    canvas.height = size;

    // Light on dark: the code lives on the page rather than on a white card.
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#E8EEF4";
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }

    box.hidden = false;
  })();

  /* ——— Small print ——— */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var mail = document.getElementById("pay-mail");
  if (mail && (invoice || amount)) {
    var s = "Question about " + (invoice ? "invoice " + invoice : "my payment") +
      (amountText ? " (" + amountText + ")" : "");
    mail.href = "mailto:rune@brilliantr.com?subject=" + encodeURIComponent(s);
  }
})();
