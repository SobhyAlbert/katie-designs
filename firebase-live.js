// Live gallery: subscribes to Firestore "artworks" (ordered by createdAt) and hands items to app.js.
// If Firebase isn't configured or fails, the site silently keeps the config.js artworks.
import { firebaseConfig, SDK, isConfigured } from "./firebase-config.js?v=10";
let ready;window.KD_READY=new Promise(r=>ready=r);setTimeout(()=>ready(),4000);
if (!isConfigured) { ready();
  console.info("[Katy Designs] Firebase not configured — using config.js artworks.");
} else {
  try {
    const { initializeApp } = await import(`${SDK}/firebase-app.js`);
    const { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } = await import(`${SDK}/firebase-firestore.js`);
    const db = getFirestore(initializeApp(firebaseConfig));
    // Commission requests -> Firestore "commissions" (schema in FIREBASE_SETUP.md)
    const trim = (v, n) => String(v ?? "").trim().slice(0, n);
    window.KD = window.KD || {};
    window.KD.saveCommission = data => addDoc(collection(db, "commissions"), {
      name: trim(data.name, 100), email: trim(data.email, 200), artworkType: trim(data.artwork_type, 40),
      size: trim(data.size, 100), description: trim(data.description, 3000), deadline: trim(data.deadline, 10),
      budget: data.budget === "" || data.budget == null ? null : Math.max(0, Number(data.budget) || 0),
      status: "new", source: "web", createdAt: serverTimestamp() });
    ready();
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    onSnapshot(q, snap => {
      const items = snap.docs.map(d => { const a = d.data(); return {
        id: "fb_" + d.id, title: a.title || "Untitled", category: (a.category || "painting").toLowerCase(),
        image: a.imageUrl, price: Number(a.price) || 0, checkout: a.checkout || "#", desc: a.desc || "", isNew: !!a.isNew };
      }).filter(a => a.image);
      window.KD && window.KD.setRemote(items);
    }, err => console.warn("[Katy Designs] Firestore unavailable, using config.js:", err.code || err));
  } catch (e) { ready(); console.warn("[Katy Designs] Firebase failed to load, using config.js:", e); }
}
