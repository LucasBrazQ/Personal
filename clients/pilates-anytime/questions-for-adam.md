# Questions for Adam — Google Ads Purchase vs Meta Purchase

Send this as-is.

---

Hi Adam — mapping Pilates Anytime events for Meta and Google.

Meta **Purchase** = **first purchase** after the 15-day trial, not renewals. Cancels are separate (trial vs paid).

Google Ads already has:

- **Signup (Trial Started)** (website, count One) — we treat as trial start, not Lead
- **Android app_store_subscription_convert** (Firebase)
- **Android In-app purchase** and **iOS In-app purchase** (Firebase, count **Every**, value 0.00)

Questions:

1. Do Android/iOS **In-app purchase** fire only on the **first purchase** after trial (same as Meta), or on **every** purchase including renewals? We’re assuming every purchase (count = Every).
2. Is **app_store_subscription_convert** trial → first purchase on Play only? Any iOS equivalent? Does it cover **website** trials?
3. Website billing isn’t Firebase. We don’t have Segment edit access. Can you create a Segment/Google event for the **first purchase** after trial (once, with value + currency), or give us Segment access? App IAP doesn’t cover web, so we still need this for the website path unless you say otherwise.
4. Same ask for trial cancel vs paid subscription cancel.
5. Why is IAP conversion value **0.00**?

We’ll add Google **Lead** in GTM ourselves (same trigger as Meta Lead). We won’t bid on In-app purchase as primary Purchase until you confirm.

Thanks
