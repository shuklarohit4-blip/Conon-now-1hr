---
name: CONON ProductCard action priority
description: Why the stepper/ADD must take priority over the "See options" CTA on product cards.
---

# ProductCard action: stepper before hasOptions

On the storefront ProductCard, the action area must render in this priority:
`onSetQty ? <QuantityStepper (+ optional small "See options")> : hasOptions ? <See options> : <ADD>`.

**Why:** An earlier version checked `hasOptions` FIRST, so every product flagged
`hasOptions: true` (UltraTech, Tata Tiscon, Asian Paints, Kajaria) rendered ONLY a
"See options" button and had NO add-to-cart control — users reported "add to cart
doesn't work on every item." Variant discovery is still reachable via the tappable
image/title and the `variantsLabel` link, so hiding ADD behind options is wrong.

**How to apply:** Keep the stepper as the primary CTA whenever a qty handler exists.
Note `CompactProductCard` never had this bug — it only branches on `onSetQty`.
