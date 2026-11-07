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
      // The account is only reachable by email — PayPal offers no paypal.me
      // handle here. The tile therefore leads with the address and tells the
      // payer what to enter.
      //
      // PARKED: the app's p2p scan-to-receive link
      // (paypal.com/qrcodes/p2pqrc/4MAJZDC8TLD5G) takes no amount and could not
      // be fetched from here to confirm it resolves to rtk@rtk-cv.dk — PayPal
      // sits behind DataDome and 403s every non-browser request. Restore it in
      // `url` only once someone has opened it and seen this account named.
      email: "rtk@rtk-cv.dk",
      handle: "",
      url: ""
    },

    wise: {
      enabled: true,
      // Wise "pay me" link — payer can pay by card/bank without knowing the
      // account numbers. The ACH details below stay visible for bookkeepers.
      url: "https://wise.com/pay/me/runek14",
      // Wise USD account details (Community Federal Savings Bank). These are
      // what the invoice used to print as "ACH bank transfer".
      accountName: "Rune Thougaard Kristensen",
      accountType: "Checking",
      routing: "026073150",
      account: "8310098788",
      bank: "Community Federal Savings Bank"
    },

    bitcoin: {
      enabled: true,
      // Strike referral — the tile's primary action. Signups are credited to
      // this link; a payer without a wallet lands straight on Strike.
      referral: "https://invite.strike.me/FDQH2P",
      // Lightning address (LUD-16). Verified live: LNURL-pay returns
      // payRequest, min 1 sat, max 16,000,000 sats, comments allowed.
      lightning: "runestone@strike.me",
      // On-chain receive address (bech32, P2WPKH — checksum verified).
      address: "bc1qf7flehxkfmmdvk0gxaqmrnfqs0srpvncrrv77u"
    }
  }
};
