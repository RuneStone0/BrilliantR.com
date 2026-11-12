/* BrilliantR, encrypted proposal page.
 *
 * The link carries the key in the fragment:  /offer/#001.<key>
 * Fragments are never sent to a server, so the ciphertext committed to the
 * public repo is only readable by whoever holds the link. The decrypted
 * document is a complete, self-contained HTML file, so it is rendered inside
 * a sandboxed iframe: its own styles, scripts and sidebar keep working, and
 * it never sees the parent page.
 */
(function () {
  "use strict";

  var unlock = document.getElementById("unlock");
  var msgTitle = document.getElementById("msg-title");
  var msg = document.getElementById("msg");
  var frame = document.getElementById("doc");

  var ERR_CUT = "This link is incomplete, part of it was cut off in transit. " +
    "Open the full link from the email, or reply and we will resend it.";

  function fail(title, message) {
    msgTitle.textContent = title;
    msgTitle.style.color = "#b4472f";
    msg.textContent = message;
    unlock.hidden = false;
    frame.hidden = true;
  }

  function b64uToBytes(text) {
    var s = text.replace(/-/g, "+").replace(/_/g, "/");
    // A length of 4n+1 cannot be valid base64. Mail clients that glue the
    // trailing text onto a link produce exactly that.
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(s) || s.length % 4 === 1) {
      throw new Error("bad-base64");
    }
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function parseLink() {
    var hash = (window.location.hash || "").replace(/^#\/?/, "");
    var m = hash.match(/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
    return m ? { id: m[1], key: m[2] } : null;
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

  function titleOf(html) {
    var m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? m[1].trim() : "";
  }

  function render(html) {
    frame.addEventListener("load", function () {
      unlock.hidden = true;
      frame.hidden = false;
      var t = titleOf(html);
      if (t) document.title = t;
    }, { once: true });
    frame.srcdoc = html;
  }

  function start() {
    if (!window.crypto || !crypto.subtle) {
      fail("This browser cannot open it",
        "The page needs a modern browser with Web Crypto. Try another browser, or reply and we will send a PDF.");
      return;
    }
    if (location.protocol === "file:") {
      fail("Open this from the link, not a local file",
        "Encrypted documents only decrypt over https, because the browser withholds Web Crypto from local files.");
      return;
    }

    var link = parseLink();
    if (!link) {
      fail("This link has no key",
        "The part of the address after the # is what decrypts the document. Copy the whole link from the email, including everything after the #.");
      return;
    }

    var keyBytes;
    try {
      keyBytes = b64uToBytes(link.key);
    } catch (e) {
      fail("This link is incomplete", ERR_CUT);
      return;
    }
    if (keyBytes.length !== 32) {
      fail("This link is incomplete", ERR_CUT);
      return;
    }

    fetch("data/" + encodeURIComponent(link.id) + ".html.enc", { cache: "no-store" })
      .then(function (res) {
        if (res.status === 404) {
          var gone = new Error("gone");
          gone.gone = true;
          throw gone;
        }
        if (!res.ok) throw new Error("http " + res.status);
        return res.arrayBuffer();
      })
      .then(function (buffer) {
        return decrypt(buffer, keyBytes).then(function (plain) {
          render(new TextDecoder("utf-8").decode(new Uint8Array(plain)));
        });
      })
      .catch(function (err) {
        if (err && err.gone) {
          fail("No longer available",
            "This document has been withdrawn, or the link belongs to something that never existed. Reply to the email if you think that is wrong.");
          return;
        }
        if (err && (err.name === "OperationError" || /bad-base64/.test(String(err.message)))) {
          fail("This link does not match the document",
            "The key in the address is not the one this document was encrypted with, which usually means part of the link was changed or cut off. Open the full link from the email.");
          return;
        }
        fail("The document did not load",
          "Check the connection and reload the page. If it keeps failing, reply to the email and we will send another copy.");
      });
  }

  start();
})();
