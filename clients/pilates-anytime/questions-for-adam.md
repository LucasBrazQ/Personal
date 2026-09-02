# Questions for Adam — Google Ads Purchase vs Meta Purchase

Send this as-is (Slack / email). Goal: decide whether Matchnode needs a **first-paid-only Purchase** in Segment for Google Ads.

---

Hi Adam — we are finishing the Pilates Anytime data map (Meta + Google). Meta **Purchase** is **only the first successful charge after the 15-day trial**, not renewals. Cancellations are separate (`TrialCanceled` vs `SubscriptionCanceled`).

On Google Ads, under Purchases, we already see:

1. **Signup (Trial Started)** — Website — Count **One** — in account-default goals. We treat this as trial start (same moment as Meta Complete Registration), not Lead.
2. **Pilates Anytime (Android) app_store_subscription_convert** — Firebase — Count Every — not in default goals.
3. **Pilates Anytime (Android) In-app purchase** — Firebase — Count **Every** — Secondary — 90-day window — value 0.00.
4. **646991927 (iOS) In-app purchase** — Firebase — Count **Every** — Secondary — 90-day window — value 0.00.

**Need you to confirm:**

**1. In-app purchase (Android + iOS Firebase)**  
Does each of these fire:

- **A)** only on the **first paid charge** after trial (same as Meta Purchase), or  
- **B)** on **every** paid charge, including monthly/annual **renewals**?

We assume **B** because Count = Every and the event name is generic `in_app_purchase`. If that is wrong, please say so.

**2. `app_store_subscription_convert` (Android)**  
Is this “trial converted to first paid” on Google Play only? Is there an iOS equivalent we should import? Does it fire for **website** trials, or only Play Store trials?

**3. Website first Purchase**  
Website billing is not Firebase. Meta Purchase for web is (or will be) **Segment**. We do **not** have Segment edit access.

- Can you **create** a Google Ads / Segment event that fires **once**, on the **first successful paid invoice after trial**, with value + currency — same definition as Meta Purchase?  
- Or grant Matchnode **Segment edit access** so we can add it (plus Trial cancel and Subscription cancel)?

Marina’s direction: we should create that Purchase unless you confirm the existing in-app purchase actions are already first-paid-only **and** cover web. App IAP does not cover web checkout, so we still expect a Segment Purchase for the website path.

**4. Cancellations**  
Same Segment ask for **trial cancel** vs **paid subscription cancel** into Google, parallel to Meta.

**5. Values**  
In-app purchase conversion **value is 0.00** in Google Ads. Are values stripped, not mapped, or is there simply no volume? We need revenue on first Purchase if we bid to value.

---

**What we will do without waiting**

- **Lead** for Google: GTM, same trigger as Meta Lead (account form success). Matchnode can build this.

**What we will not do until you reply**

- Treat Firebase In-app purchase as equivalent to Meta Purchase.
- Bid on In-app purchase as a primary Purchase goal.

Thanks  
[name]
