# Katie Designs (كا تي ديزاينز) — art portfolio
Static site (index.html, about.html [Arabic], style.css, app.js, config.js). Hosted on GitHub Pages.

## Edit everything in `config.js`
- `SITE.formEmail` — **PLACEHOLDER** `your-email@example.com`. Set your real email; the first commission submission triggers a FormSubmit activation email — click it once.
- `SITE.instagram` — placeholder link.
- Each artwork's `checkout` — **PLACEHOLDER** `https://buy.stripe.com/REPLACE_ME_n`. Create a Stripe Payment Link (with the hi-res file delivered via Stripe's after-payment redirect/receipt) or a Gumroad product, and paste its URL.

## Add a new artwork
1. Upload the image to `images/` (e.g. `images/sunflowers.jpg`, ~1600px wide).
2. In `config.js` copy a line in `ARTWORKS`, give it a new `id`, `title`, `category` (portraits|landscapes|sketches|digital|painting), `image:"images/sunflowers.jpg"`, `price`, `checkout`, `desc`.
3. Commit — the site updates in ~1 minute. Leave `image:""` to show a labeled placeholder; `price:0` hides the Buy button.
