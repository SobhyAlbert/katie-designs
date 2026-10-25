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

## Cache busting
When you change style.css / app.js / config.js / bg.js, bump the `?v=` number on their references in index.html and about.html (e.g. `?v=2` -> `?v=3`) so visitors get the new files.

## Background painting credit
`images/starry-night.jpg` is Vincent van Gogh, *The Starry Night* (1889), from Wikimedia Commons:
https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg
— **public domain** (the artist died in 1890; faithful reproductions of 2D public-domain art are public domain). Resized/compressed for the web.
`bg.js` paints it once with brush strokes, cross-fades to the image, then stops; repeat visits show the static image (localStorage key `kdStarryPainted`; clear it to replay).

Background plays once per browser session (sessionStorage key `kd-painted-v6`), also with reduced motion. Add `?replay=1` to force it again.

Portrait/narrow screens (≤768px or taller than wide) use Vincent van Gogh, *Café Terrace at Night* (1888), public domain, via Wikimedia Commons (`Vincent_Willem_van_Gogh_015.jpg`), saved as `images/cafe-terrace.jpg`.

## Live uploads with Firebase (optional)
See **FIREBASE_SETUP.md**. Once you fill in `firebase-config.js` and publish the rules, the owner uploads artworks at `/admin.html` and they show up on the site straight away. Without it, the site uses `config.js`.
