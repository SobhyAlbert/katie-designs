/* ============================================================
   FIREBASE CONFIG — fill these in (see FIREBASE_SETUP.md)
   Firebase console → Project settings → General → Your apps → Web app → "SDK setup and configuration" → Config.
   These web keys are NOT secrets (security comes from firestore.rules / storage.rules),
   If any value contains "REPLACE_ME" the site just uses config.js (no Firebase).
   ============================================================ */
export const firebaseConfig = {
  apiKey: "AIzaSyBRgZtM17TqD8bcclzB44z_ej5GKC7vm2k",
  authDomain: "katie-designs.firebaseapp.com",
  projectId: "katie-designs",
  storageBucket: "katie-designs.firebasestorage.app",
  messagingSenderId: "945023747152",
  appId: "1:945023747152:web:466f28f0a3f710936dfd55",
};
// Firebase SDK version loaded from the gstatic CDN (modular v10+)
export const SDK = "https://www.gstatic.com/firebasejs/10.14.1";
export const isConfigured = !Object.values(firebaseConfig).some(v => String(v).includes("REPLACE_ME"));
