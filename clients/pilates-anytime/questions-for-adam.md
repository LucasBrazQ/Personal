# Questions for Adam — Google Ads Purchase vs Meta Purchase

Send this as-is (Slack / email). Goal: decide whether Matchnode needs a **first purchase** event in Segment for Google Ads.

---

Hi Adam — we are mapping Pilates Anytime events for Meta and Google Ads.

On Meta, **Purchase** is the **first purchase** after the 15-day trial ends — not renewals. Cancels are separate (`TrialCanceled` vs `SubscriptionCanceled`).

On Google Ads we already have these Purchase-category actions:

1. **Signup (Trial Started)** — Website — Count **One** — in account-default goals. We treat this as trial start (same as Meta Complete Registration), not Lead.
2. **Pilates Anytime (Android) app_store_subscription_convert** — Firebase — Count Every — not in default goals.
3. **Pilates Anytime (Android) In-app purchase** — Firebase — Count **Every** — Secondary — 90-day window — value 0.00.
4. **646991927 (iOS) In-app purchase** — Firebase — Count **Every** — Secondary — 90-day window — value 0.00.

Can you confirm:

**1. In-app purchase (Android + iOS Firebase)**  
Do these fire:

- **A)** only on the **first purchase** after the trial (same as Meta Purchase), or  
- **B)** on **every** purchase, including monthly/annual **renewals**?

We are assuming **B**, because Count = Every and the event is generic `in_app_purchase`. Please correct us if it is actually first purchase only.

**2. `app_store_subscription_convert` (Android)**  
Is this “trial converted to first purchase” on Google Play only? Is there an iOS equivalent we should import? Does it fire for **website** trials, or only Play Store trials?

**3. Website first purchase**  
Website billing is not Firebase. Meta’s web Purchase is (or will be) **Segment**. We do not have Segment edit access.

- Can you **create** a Google Ads / Segment event that fires **once**, on the **first purchase** after the trial, with value + currency — same definition as Meta Purchase?  
- Or grant Matchnode **Segment edit access** so we can add it (plus trial cancel and subscription cancel)?

We think we should create that first-purchase event unless you confirm the existing in-app purchase actions are already first-purchase only **and** cover web. App IAP does not cover web checkout, so we still expect a Segment Purchase for the website path.

**4. Cancellations**  
Same Segment ask for **trial cancel** vs **paid subscription cancel** into Google, parallel to Meta.

**5. Values**  
In-app purchase conversion **value is 0.00** in Google Ads. Are values stripped, not mapped, or is there simply no volume? We need revenue on the first purchase if we bid to value.

We can build **Lead** for Google in GTM without waiting (same trigger as Meta Lead: account form success). We will not treat Firebase In-app purchase as Meta Purchase, or bid on it as a primary Purchase goal, until you reply.

Thanks  
[name]
