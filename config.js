/* ============================================================
   KATY DESIGNS — EDIT EVERYTHING HERE
   To add an artwork: copy one { ... } block, change the fields.
   image:    path to your image (e.g. "images/my-art.jpg") — picsum URLs below are PLACEHOLDER photos; null = "Coming soon" empty frame
   price:    digital copy price (number) — set to 0 to hide the Buy button
   checkout: your Stripe Payment Link / Gumroad URL (PLACEHOLDER below!)
   ============================================================ */
const SITE = {
  name: "Katy Designs",
  currency: "$",
  // PLACEHOLDER: replace with your real email (FormSubmit sends commission requests here)
  formEmail: "your-email@example.com",
  instagram: "https://instagram.com/your-handle", // PLACEHOLDER
};

const ARTWORKS = [
  { id:1, title:"Quiet Gaze",        category:"portraits",  image:"https://picsum.photos/seed/quiet-gaze/800/1000", price:15, checkout:"https://buy.stripe.com/REPLACE_ME_1", desc:"Graphite & charcoal portrait study." },
  { id:2, title:"Nile at Dusk",      category:"landscapes", image:"https://picsum.photos/seed/nile-at-dusk/800/1000", price:20, checkout:"https://buy.stripe.com/REPLACE_ME_2", desc:"Oil landscape of the river at sunset." },
  { id:3, title:"Café Sketchbook",   category:"sketches",   image:"https://picsum.photos/seed/caf-sketchbook/800/1000", price:8,  checkout:"https://buy.stripe.com/REPLACE_ME_3", desc:"Ink sketches from a morning café." },
  { id:4, title:"Neon Garden",       category:"digital",    image:"https://picsum.photos/seed/neon-garden/800/1000", price:18, checkout:"https://buy.stripe.com/REPLACE_ME_4", desc:"Digital illustration, vivid palette." },
  { id:5, title:"Still Life in Blue",category:"painting",   image:"https://picsum.photos/seed/still-life-in-blue/800/1000", price:22, checkout:"https://buy.stripe.com/REPLACE_ME_5", desc:"Acrylic still life on canvas." },
  { id:6, title:"Grandmother",       category:"portraits",  image:"https://picsum.photos/seed/grandmother/800/1000", price:15, checkout:"https://buy.stripe.com/REPLACE_ME_6", desc:"Watercolor portrait." },
  { id:7, title:"Desert Light",      category:"landscapes", image:"https://picsum.photos/seed/desert-light/800/1000", price:20, checkout:"https://buy.stripe.com/REPLACE_ME_7", desc:"Gouache desert scene." },
  { id:8, title:"Hands Study",       category:"sketches",   image:"https://picsum.photos/seed/hands-study/800/1000", price:8,  checkout:"https://buy.stripe.com/REPLACE_ME_8", desc:"Pencil anatomy study." },
  { id:9, title:"Dream City",        category:"digital",    image:"https://picsum.photos/seed/dream-city/800/1000", price:18, checkout:"https://buy.stripe.com/REPLACE_ME_9", desc:"Digital concept art." },

  /* ---- NEW WORKS, COMING SOON: image:null = empty framed slot (no buy button). ---- */
  { id:101, title:"Coming soon", category:"new", image:null },
  { id:102, title:"Coming soon", category:"new", image:null },
  { id:103, title:"Coming soon", category:"new", image:null },
  { id:104, title:"Coming soon", category:"new", image:null },
  { id:105, title:"Coming soon", category:"new", image:null },
  { id:106, title:"Coming soon", category:"new", image:null },
];
