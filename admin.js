import { firebaseConfig, SDK, isConfigured } from "./firebase-config.js?v=10";
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const msg = (el, t, cls = "") => { el.textContent = t; el.className = "msg " + cls; };

if (!isConfigured) { $("#notcfg").hidden = false; }
else {
  const { initializeApp } = await import(`${SDK}/firebase-app.js`);
  const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } = await import(`${SDK}/firebase-auth.js`);
  const { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } = await import(`${SDK}/firebase-storage.js`);
  const { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } = await import(`${SDK}/firebase-firestore.js`);
  const app = initializeApp(firebaseConfig), auth = getAuth(app), st = getStorage(app), db = getFirestore(app);
  st.maxUploadRetryTime = 20000; // fail fast (e.g. Storage not enabled) instead of retrying for 10 min
  let unsub = null;

  onAuthStateChanged(auth, user => {
    $("#login").hidden = !!user; $("#up").hidden = !user; $("#manage").hidden = !user; $("#out").hidden = !user;
    if (unsub) { unsub(); unsub = null; }
    if (user) unsub = onSnapshot(query(collection(db, "artworks"), orderBy("createdAt", "desc")), snap => {
      $("#list").innerHTML = snap.empty ? '<p class="sub">No uploads yet.</p>' : snap.docs.map(d => { const a = d.data(); return `
        <div class="row"><img src="${esc(a.imageUrl)}" alt=""><div class="t"><b>${esc(a.title)}</b><span class="tag">${esc(a.category)} · $${esc(a.price)}${a.isNew ? " · NEW" : ""}</span></div>
        <button class="btn ghost" data-del="${esc(d.id)}" data-path="${esc(a.storagePath)}" aria-label="Delete ${esc(a.title)}">Delete</button></div>`; }).join("");
    }, e => { $("#list").textContent = "Couldn't load list: " + (e.code || e.message); });
  });

  $("#login").addEventListener("submit", async e => { e.preventDefault();
    try { await signInWithEmailAndPassword(auth, $("#le").value.trim(), $("#lp").value); msg($("#lmsg"), ""); }
    catch (err) { msg($("#lmsg"), "Sign-in failed: " + (err.code || err.message), "bad"); } });
  $("#out").onclick = () => signOut(auth);

  $("#file").addEventListener("change", () => { const f = $("#file").files[0], p = $("#preview");
    if (f) { p.src = URL.createObjectURL(f); p.style.display = "block"; if (!$("#title").value) $("#title").value = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "); } });

  $("#up").addEventListener("submit", async e => { e.preventDefault();
    const f = $("#file").files[0], title = $("#title").value.trim(), um = $("#umsg");
    if (!f || !f.type.startsWith("image/")) return msg(um, "Please choose an image file.", "bad");
    if (!title) return msg(um, "Please enter a title.", "bad");
    const co = $("#checkout").value.trim(); if (co && !/^https:\/\//.test(co)) return msg(um, "Checkout link must start with https://", "bad");
    $("#go").disabled = true; msg(um, "Preparing image…");
    try {
      const blob = await shrink(f, 2000);
      if (blob.size >= 10 * 1024 * 1024) throw new Error("Image is still over 10MB after compression.");
      const safe = f.name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "art";
      const path = `artworks/${Date.now()}_${safe}.${blob.type === "image/png" ? "png" : "jpg"}`;
      const task = uploadBytesResumable(ref(st, path), blob, { contentType: blob.type, cacheControl: "public,max-age=31536000" });
      await new Promise((res, rej) => task.on("state_changed", s => { const p = Math.round(s.bytesTransferred / s.totalBytes * 100); $("#bar").style.width = p + "%"; msg(um, `Uploading… ${p}%`); }, rej, res));
      const url = await getDownloadURL(task.snapshot.ref);
      await addDoc(collection(db, "artworks"), { title, category: $("#cat").value, price: Math.max(0, +$("#price").value || 0),
        checkout: co, desc: $("#desc").value.trim(), imageUrl: url, storagePath: path, isNew: $("#isnew").checked, createdAt: serverTimestamp() });
      msg(um, "Uploaded! It's live on the site now.", "good"); $("#up").reset(); $("#preview").style.display = "none";
    } catch (err) { msg(um, explain(err), "bad"); }
    finally { $("#go").disabled = false; setTimeout(() => $("#bar").style.width = "0", 1500); } });

  $("#list").addEventListener("click", async e => { const b = e.target.closest("[data-del]"); if (!b) return;
    if (!confirm("Delete this artwork from the site and storage?")) return;
    b.disabled = true;
    try { if (b.dataset.path) await deleteObject(ref(st, b.dataset.path)).catch(err => { if (err.code !== "storage/object-not-found") throw err; });
      await deleteDoc(doc(db, "artworks", b.dataset.del)); }
    catch (err) { alert("Delete failed: " + (err.code || err.message)); b.disabled = false; } });
}

// Friendly errors. Storage needs the Blaze plan; until it's enabled the bucket doesn't exist.
function explain(err) {
  const c = err && err.code || "", t = String(err && (err.message || err) || "");
  if (c === "storage/unknown" || c === "storage/bucket-not-found" || c === "storage/project-not-found" || c === "storage/retry-limit-exceeded" ||
      /bucket|404|does not exist|not found|CORS|Failed to fetch|network/i.test(c + " " + t))
    return "Storage not enabled yet: Firebase Storage isn't set up for this project (it needs the Blaze plan). Enable it in the Firebase console → Build → Storage, then try again. Nothing was saved.";
  if (c === "storage/unauthorized" || c === "permission-denied") return "Not allowed: check that you're signed in as the owner and the rules are published with your UID.";
  return "Upload failed: " + (c || t);
}
// Resize to max `max` px on the long side and re-encode (JPEG 0.85; PNG kept for transparency). Small files pass through.
export async function shrink(file, max) {
  const bmp = await createImageBitmap(file).catch(() => null); if (!bmp) return file;
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (s === 1 && file.size < 2 * 1024 * 1024) return file;
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return await new Promise(r => c.toBlob(b => r(b || file), type, .85));
}
