/* BrilliantR — encrypted invoice page.
 *
 * The link carries the key in the fragment:  /i/#002.<key>
 * Fragments are never sent to a server, so the ciphertext committed to the
 * public repo is only readable by whoever holds the link. Everything below
 * renders from decrypted JSON; nothing is fetched in plaintext.
 */
(function () {
  "use strict";

  var state = document.getElementById("inv-state");
  var sheet = document.getElementById("inv-sheet");
  var payBlock = document.getElementById("inv-pay");

  var CUT_OFF = "This link is incomplete — part of it was cut off in transit. " +
    "Open the full link from the email, or reply and we’ll resend it.";

  function fail(message) {
    state.textContent = message;
    state.classList.add("is-error");
    state.hidden = false;
    sheet.hidden = true;
    payBlock.hidden = true;
  }

  function b64uToBytes(text) {
    var s = text.replace(/-/g, "+").replace(/_/g, "/");
    // A length of 4n+1 cannot be valid base64. Mail clients that glue the
    // trailing text onto a link produce exactly that, and atob() would throw
    // mid-boot, leaving the page stuck on "Opening invoice…".
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(s) || s.length % 4 === 1) {
      throw new Error("bad-base64");
    }
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function decrypt(buffer, keyBytes) {
    return crypto.subtle
      .importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"])
      .then(function (key) {
        // Layout: 12-byte IV, then ciphertext + tag.
        var iv = new Uint8Array(buffer.slice(0, 12));
        var ct = new Uint8Array(buffer.slice(12));
        return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
      });
  }

  function parseLink() {
    var hash = (window.location.hash || "").replace(/^#\/?/, "");
    var m = hash.match(/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
    return m ? { id: m[1], key: m[2] } : null;
  }

  function money(value, currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD"
      }).format(value);
    } catch (e) {
      return "$" + Number(value).toFixed(2);
    }
  }

  function dateText(value) {
    if (!value) return "";
    var d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00Z" : value);
    if (isNaN(d)) return value;
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
    }).format(d);
  }

  function hoursText(h) {
    if (h === null || h === undefined) return "—";
    // Invoices show 2.0 rather than 2, matching how the hours were entered.
    return Number(h).toFixed(1);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function fillBlocks(target, lines) {
    target.textContent = "";
    (lines || []).forEach(function (line, i) {
      if (i) target.appendChild(document.createElement("br"));
      target.appendChild(document.createTextNode(line));
    });
  }

  function renderInvoice(data) {
    var currency = data.currency || "USD";

    document.title = "Invoice " + data.number + " — BrilliantR";
    document.getElementById("inv-number").textContent = data.number;
    document.getElementById("inv-issued").textContent = dateText(data.issued);
    document.getElementById("inv-due").textContent = dateText(data.due);

    fillBlocks(document.getElementById("inv-from"),
      [data.company.name].concat(data.company.lines));
    fillBlocks(document.getElementById("inv-to"),
      [data.client.name].concat(data.client.lines));

    var tbody = document.getElementById("inv-rows");
    tbody.textContent = "";
    data.items.forEach(function (item, i) {
      var tr = document.createElement("tr");
      tr.appendChild(el("td", null, String(i + 1)));
      tr.appendChild(el("td", null, item.description));
      tr.appendChild(el("td", "inv-num", hoursText(item.hours)));
      tr.appendChild(el("td", "inv-num",
        item.rate === null || item.rate === undefined ? "—" : money(item.rate, currency)));
      tr.appendChild(el("td", "inv-num", money(item.amount, currency)));
      tbody.appendChild(tr);
    });

    var totals = document.getElementById("inv-totals");
    totals.textContent = "";
    function row(label, value, extra) {
      var div = el("div", extra || null);
      div.appendChild(el("span", null, label));
      div.appendChild(el("span", "inv-val", value));
      totals.appendChild(div);
    }
    row("Subtotal", money(data.subtotal, currency));
    if (data.discount && data.discount.amount) {
      row(data.discount.label, "-" + money(data.discount.amount, currency));
    }
    row("Tax", money(data.tax, currency));
    row("Total due", money(data.total, currency), "inv-grand");

    var note = document.getElementById("inv-note");
    if (data.note) {
      note.textContent = data.note;
      note.hidden = false;
    }

    var ref = "brilliantr-invoice-" + data.number;
    document.getElementById("inv-ref").textContent = "Ref " + ref;

    sheet.hidden = false;
    state.hidden = true;
    return { total: data.total, currency: currency, ref: ref };
  }

  function copyButton(label, value) {
    var btn = el("button", "pay-link", label);
    btn.type = "button";
    btn.addEventListener("click", function () {
      var done = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(value).then(done, function () {
        btn.textContent = "Select the text above";
      });
    });
    return btn;
  }

  function tile(mark, markClass, title, sub, opts) {
    opts = opts || {};
    var card = el("article", "pay-tile" + (opts.wide ? " pay-tile--wide" : ""));
    var head = el("div", "pay-tile-head");
    head.appendChild(el("span", "pay-mark " + markClass, mark));
    var box = document.createElement("div");
    box.appendChild(el("h2", null, title));
    box.appendChild(el("p", "pay-tile-sub", sub));
    head.appendChild(box);
    card.appendChild(head);
    if (opts.body) card.appendChild(opts.body);
    var footEl = el("div", "pay-tile-foot");
    if (opts.foot) footEl.appendChild(opts.foot);
    card.appendChild(footEl);
    return card;
  }

  /* A labelled value with its own Copy button, laid out like the pay page. */
  function detailRow(label, value, stacked) {
    var row = el("div", "pay-row" + (stacked ? " pay-row--stack" : ""));
    row.appendChild(el("dt", null, label));
    var dd = el("dd", null, value);
    row.appendChild(dd);
    var copy = el("button", "pay-copy", "Copy");
    copy.type = "button";
    copy.addEventListener("click", function () {
      var done = function () {
        copy.textContent = "Copied";
        copy.classList.add("is-done");
        setTimeout(function () {
          copy.textContent = "Copy";
          copy.classList.remove("is-done");
        }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(value).then(done, function () {});
    });
    row.appendChild(copy);
    return row;
  }

  function detailBody(rows) {
    var wrap = el("div", "pay-tile-body inv-details");
    var dl = document.createElement("dl");
    rows.forEach(function (r) { dl.appendChild(detailRow(r[0], r[1], r[2])); });
    wrap.appendChild(dl);
    return wrap;
  }

  function link(label, href, external) {
    var a = el("a", "pay-link", label + " ");
    a.href = href;
    if (external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.insertAdjacentHTML("beforeend",
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>');
    return a;
  }

  function renderPay(ctx, payUrl) {
    var cfg = window.BR_PAY && window.BR_PAY.methods;
    if (!cfg) return;

    var grid = document.getElementById("pay-grid");
    grid.textContent = "";
    document.getElementById("pay-amount").textContent = money(ctx.total, ctx.currency);

    var amount = Number(ctx.total).toFixed(2);
    var refNote = el("p", "inv-ref-note", "Reference: " + ctx.ref);

    if (cfg.venmo && cfg.venmo.enabled) {
      var v = "https://venmo.com/u/" + encodeURIComponent(cfg.venmo.handle) +
        "?txn=pay&amount=" + amount + "&note=" + encodeURIComponent(ctx.ref);
      grid.appendChild(tile("V", "pay-mark--venmo", "Venmo", "@" + cfg.venmo.handle, {
        foot: link("Open Venmo", v, true)
      }));
    }

    if (cfg.paypal && cfg.paypal.enabled && cfg.paypal.email) {
      grid.appendChild(tile("P", "pay-mark--paypal", "PayPal", cfg.paypal.email, {
        foot: copyButton("Copy email", cfg.paypal.email)
      }));
    }

    if (cfg.wise && cfg.wise.enabled) {
      var w = cfg.wise;
      var rows = [];
      if (w.accountName) rows.push(["Account name", w.accountName, true]);
      if (w.routing) rows.push(["Routing (ABA)", w.routing, true]);
      if (w.account) rows.push(["Account number", w.account, true]);
      if (w.bank) rows.push(["Bank", w.bank, true]);
      if (w.accountType) rows.push(["Account type", w.accountType, true]);
      grid.appendChild(tile("B", "pay-mark--bank", "ACH / wire",
        "Direct from your bank — no fees", {
          body: rows.length ? detailBody(rows) : null,
          foot: refNote
        }));
    }

    if (cfg.wise && cfg.wise.enabled && cfg.wise.url) {
      var wiseBody = el("p", "pay-tile-body",
        "Wise takes cards and bank transfers and handles the currency for you — " +
        "useful if your bank isn’t set up for USD wires.");
      grid.appendChild(tile("W", "pay-mark--wise", "Wise",
        "Card, Apple Pay, or bank via Wise", {
          body: wiseBody,
          foot: link("Open Wise", cfg.wise.url, true)
        }));
    }

    if (cfg.bitcoin && cfg.bitcoin.enabled) {
      var b = cfg.bitcoin;
      var btcRows = [];
      if (b.lightning) btcRows.push(["Lightning", b.lightning, true]);
      if (b.address) btcRows.push(["On-chain", b.address, true]);
      var btcFoot = el("div");
      if (b.referral) {
        var hint = link("No wallet yet? Strike", b.referral, true);
        hint.className = "pay-link pay-link--hint";
        btcFoot.appendChild(hint);
      }
      grid.appendChild(tile("₿", "pay-mark--bitcoin", "Bitcoin",
        b.lightning ? "Lightning (instant) or on-chain" : "On-chain", {
          wide: true,
          body: btcRows.length ? detailBody(btcRows) : null,
          foot: btcFoot.childNodes.length ? btcFoot : null
        }));
    }

    var full = document.getElementById("pay-full");
    if (payUrl) full.href = payUrl;

    payBlock.hidden = false;
  }

  function wirePdf(id, keyBytes, number) {
    var btn = document.getElementById("inv-pdf");
    btn.addEventListener("click", function () {
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = "Preparing…";
      fetch("data/" + encodeURIComponent(id) + ".pdf.enc", { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) throw new Error("missing");
          return res.arrayBuffer();
        })
        .then(function (buf) { return decrypt(buf, keyBytes); })
        .then(function (plain) {
          var blob = new Blob([plain], { type: "application/pdf" });
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "Invoice-" + number + ".pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          btn.textContent = label;
        })
        .catch(function () {
          btn.textContent = "PDF unavailable";
        })
        .then(function () { btn.disabled = false; });
    });
  }

  function boot() {
    var link = parseLink();
    if (!link) {
      fail("This link is incomplete. Open the full link from your invoice email.");
      return;
    }
    if (!window.crypto || !window.crypto.subtle) {
      fail("This browser can’t open the invoice. Try a current browser, or ask for a PDF.");
      return;
    }

    var keyBytes;
    try {
      keyBytes = b64uToBytes(link.key);
    } catch (e) {
      fail(CUT_OFF);
      return;
    }
    if (keyBytes.length !== 32) {
      fail(CUT_OFF);
      return;
    }

    fetch("data/" + encodeURIComponent(link.id) + ".json.enc", { cache: "no-store" })
      .then(function (res) {
        if (res.status === 404) {
          throw new Error("gone");
        }
        if (!res.ok) throw new Error("http");
        return res.arrayBuffer();
      })
      .then(function (buf) { return decrypt(buf, keyBytes); })
      .then(function (plain) {
        var data = JSON.parse(new TextDecoder().decode(plain));
        var ctx = renderInvoice(data);
        renderPay(ctx, data.payUrl);
        wirePdf(link.id, keyBytes, data.number);
      })
      .catch(function (err) {
        if (err && err.message === "gone") {
          fail("This invoice is no longer available. If you still need it, reply to the email and we’ll resend it.");
        } else if (err && err.name === "OperationError") {
          fail("This link doesn’t match the invoice. Check that you copied the whole link.");
        } else {
          fail("Couldn’t open this invoice. Check your connection and reload the page.");
        }
      });
  }

  try {
    boot();
  } catch (e) {
    fail("Couldn’t open this invoice. Check your connection and reload the page.");
  }
})();
