/* BrilliantR — payment details config.
 *
 * Single source of truth for /pay. Public file — no secrets beyond what is
 * already printed on every invoice. Disabled methods are not rendered
 * (append ?preview=1 to the page URL to see them as placeholders).
 */
window.BR_PAY = {
  // Fallback when the link has no ?inv= parameter.
  company: "BrilliantR",
  email: "rune@brilliantr.com",

  methods: {
    venmo: {
      enabled: true,
      handle: "RuneStone",
      url: "https://venmo.com/u/RuneStone"
    },

    paypal: {
      enabled: true,
      // PayPal personal "scan to receive" link (from the PayPal app QR code).
      // Unlike paypal.me it does not accept an amount in the URL, so the payer
      // types the figure shown at the top of the page.
      handle: "",
      url: "https://www.paypal.com/qrcodes/p2pqrc/4MAJZDC8TLD5G"
    },

    wise: {
      enabled: true,
      // Wise USD account details (Community Federal Savings Bank). These are
      // what the invoice used to print as "ACH bank transfer".
      accountName: "Rune Thougaard Kristensen",
      accountType: "Checking",
      routing: "026073150",
      account: "8310098788",
      bank: "Community Federal Savings Bank",
      // Optional fixed Wise payment link; leave "" to rely on the details above.
      url: ""
    },

    bitcoin: {
      enabled: true,
      // On-chain address; leave "" to offer a Lightning invoice by email instead.
      address: "",
      lightning: ""
    }
  }
};
