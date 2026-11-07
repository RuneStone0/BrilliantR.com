/* BrilliantR /pay — hydrates the payment tiles from pay-details.js and the
 * invoice parameters on the link (?amt=..&inv=..&memo=..).
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
  var memo = (params.get("memo") || "").trim();

  var currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  var amountText = amount ? currency.format(amount) : "";
  var amountParam = amount ? amount.toFixed(2) : "";

  /* A single human-readable reference reused in every note/memo field. */
  function reference() {
    var bits = [];
    if (invoice) bits.push("Invoice " + invoice);
    if (memo) bits.push(memo);
    return bits.join(" — ") || "BrilliantR payment";
  }

  (function renderSummary() {
    if (!amount && !invoice) return;
    var wrap = document.getElementById("pay-summary");
    var amtEl = document.getElementById("pay-amount");
    var invEl = document.getElementById("pay-inv-line");
    var memoEl = document.getElementById("pay-memo-line");

    if (amount) {
      amtEl.textContent = amountText;
    } else {
      document.querySelector(".pay-summary-label").textContent = "Invoice";
      amtEl.textContent = invoice;
      invEl.hidden = true;
    }
    if (amount && !invoice) invEl.hidden = true;
    if (invoice) invEl.textContent = "Invoice " + invoice;
    if (memo) {
      memoEl.textContent = memo;
      memoEl.hidden = false;
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
    if (!methodActive("paypal") || (!m.url && !m.handle)) {
      return placeholder("paypal", "PayPal is not connected to this page yet.");
    }
    var t = tile("paypal");
    var link = t.querySelector('[data-action="external"]');

    if (m.handle) {
      // paypal.me/<handle> accepts the amount in the path.
      var base = (m.url || "https://www.paypal.com/paypalme/" + encodeURIComponent(m.handle))
        .replace(/\/+$/, "");
      link.href = amountParam ? base + "/" + amountParam + "USD" : base;
      fill("paypal-handle", "paypal.me/" + m.handle);
    } else {
      // QR p2p link: no amount parameter, so tell the payer to type it.
      link.href = m.url;
      link.childNodes[0].textContent = "Open PayPal ";
      var body = t.querySelector(".pay-tile-body");
      if (amountText) {
        body.textContent = "Enter " + amountText + " in PayPal and put " +
          (invoice ? "invoice " + invoice : "your invoice number") + " in the note.";
      }
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
      var foot = tile("wise").querySelector(".pay-tile-foot");
      var b = foot.querySelector('[data-action="toggle-details"]');
      var a = document.createElement("a");
      a.className = "pay-link";
      a.href = m.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open Wise";
      if (b) b.replaceWith(a);
    }
  })();

  /* ——— Bitcoin ——— */
  (function bitcoin() {
    var m = CFG.methods.bitcoin;
    if (!methodActive("bitcoin")) {
      return placeholder("bitcoin", "Bitcoin is not connected to this page yet.");
    }
    var link = tile("bitcoin").querySelector('[data-action="btc"]');
    var ref = reference();

    if (m.address) {
      var uri = "bitcoin:" + m.address + "?label=" + encodeURIComponent("BrilliantR") +
        "&message=" + encodeURIComponent(ref);
      link.href = uri;
      link.textContent = "Open in wallet";
      fill("btc-body", "Send the invoice amount in BTC to the address below. On-chain only — " +
        "the dollar figure holds at the rate when the coins arrive, so tell us once it's sent.");
      fill("btc-address", m.address);
      // Without a toggle the address sits in a panel nobody can open.
      var btcToggle = document.createElement("button");
      btcToggle.type = "button";
      btcToggle.className = "pay-link";
      btcToggle.setAttribute("data-action", "toggle-details");
      btcToggle.setAttribute("data-label-open", "Show address");
      btcToggle.setAttribute("data-label-close", "Hide address");
      btcToggle.setAttribute("aria-expanded", "false");
      btcToggle.appendChild(document.createTextNode("Show address "));
      btcToggle.insertAdjacentHTML("beforeend",
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
      link.parentElement.appendChild(btcToggle);
      if (m.lightning) {
        var panel = tile("bitcoin").querySelector('[data-panel="bitcoin"] dl');
        var row = document.createElement("div");
        row.className = "pay-row";
        row.innerHTML = '<dt>Lightning</dt><dd data-copy>__LN__</dd>';
        row.querySelector("dd").textContent = m.lightning;
        panel.appendChild(row);
        addCopy(row.querySelector("dd"));
      }
      addCopy(tile("bitcoin").querySelector('[data-fill="btc-address"]'));
    } else {
      var subject = "Lightning invoice request — " + (invoice ? "Invoice " + invoice : "BrilliantR");
      var body = "Please send a Lightning invoice for " + (amountText || "the amount due") +
        (invoice ? " (invoice " + invoice + ")" : "") + ".\n\nThanks!";
      link.href = "mailto:" + (CFG.email || "rune@brilliantr.com") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
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
    var map = { bank: "wise", wise: "wise", bitcoin: "bitcoin", btc: "bitcoin" };
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
