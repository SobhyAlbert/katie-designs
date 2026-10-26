# Firebase setup (live uploads)

Images are stored in **Firebase Storage**. Each image's details (title, price and so on) go in a **Firestore** `artworks` document. The site listens to Firestore with `onSnapshot`, so a new upload shows up on the site within seconds, with no redeploy. Until `firebase-config.js` is filled in, the site just shows the artworks in `config.js`.

## 1. Create the project
1. Go to https://console.firebase.google.com → **Add project**, e.g. `katie-designs`. Google Analytics is optional.
2. **Project settings (⚙) → General → Your apps → Web (`</>`)**. Register the app (nickname "Katy Designs site"). You don't need Firebase Hosting.
3. Copy the `firebaseConfig` values into **`firebase-config.js`**: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
   These web keys aren't secret. Access is protected by the rules below.

## 2. Turn on the services
- **Build → Firestore Database → Create database**. Production mode, pick a nearby region (e.g. `europe-west1`).
- **Build → Storage → Get started**. Production mode, same region. New projects may need the Blaze plan for Storage; it has a free tier.
- **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.

## 3. Create the owner account
1. **Authentication → Users → Add user**: enter the owner's email and a strong password.
2. Copy that user's **User UID**.
3. Replace `OWNER_UID_HERE` with that UID in **both** `firestore.rules` and `storage.rules`.
4. Optionally, turn off new sign-ups (**Authentication → Settings → User actions**). The rules already block everyone except the owner either way.

## 4. Publish the rules
- **Firestore → Rules**: paste in `firestore.rules`, then **Publish**.
- **Storage → Rules**: paste in `storage.rules`, then **Publish**.
- If you use the Firebase CLI instead: `firebase deploy --only firestore:rules,storage`.

## 5. Authorized domains
**Authentication → Settings → Authorized domains → Add domain** → `sobhyalbert.github.io`. Keep `localhost` for testing.

## 6. Index
The gallery sorts by `createdAt`, which is a single-field index, so Firestore creates it automatically. If the browser console ever shows an index link, click it.

## 7. Storage CORS (usually not needed)
Showing images with `<img src="…">` works without CORS. You only need it to fetch image data from scripts:
```
gsutil cors set cors.json gs://YOUR_BUCKET   # e.g. gs://katie-designs.firebasestorage.app
```

## 8. Use it
Open **/admin.html** → sign in → choose an image → fill in the details → **Upload**.
- Large images are shrunk in the browser to 2000px max (JPEG, 85% quality).
- Ticking **"New work"** puts the piece in the Coming Soon slots first.
- **Delete** removes both the file and its document.

## 9. Storage and the Blaze plan
Until Storage is enabled (it needs the Blaze plan), the public site still works: it reads artworks from Firestore and commissions are still saved. Only uploading from admin.html fails, with the message **"Storage not enabled yet"**.

## 10. Data schema (shared by the web site and the Android app `com.katiedesigns.app`)

### `commissions/{autoId}`: written by the public commission form
| field | type | rules |
|---|---|---|
| name | string | required, 1–100 |
| email | string | required, 3–200, email format |
| artworkType | string | required, 1–40 (Portrait, Landscape, Sketch, Digital art, Painting, Other) |
| size | string | optional, ≤100 |
| description | string | required, 10–3000 |
| deadline | string | optional, `YYYY-MM-DD` or "" |
| budget | number \| null | optional, 0–1,000,000 (USD) |
| status | string | must be `"new"` on create; the owner may later set e.g. `"accepted"`, `"done"` |
| source | string | `"web"` or `"android"` |
| createdAt | timestamp | `serverTimestamp()` (the rules check it equals `request.time`) |

Anyone can **create** a commission. Only the owner can **read, update or delete** them. The Android app (signed in as the owner) can listen live:
```kotlin
Firebase.firestore.collection("commissions").orderBy("createdAt", Query.Direction.DESCENDING)
  .addSnapshotListener { snap, e -> /* show / notify on new docs (status == "new") */ }
```

### `artworks/{autoId}`: the gallery, written by admin.html or the Android app (owner only)
| field | type | notes |
|---|---|---|
| title | string | 1–120 |
| category | string | portraits, landscapes, sketches, digital or painting |
| price | number | USD; 0 hides the Buy button |
| checkout | string | https Stripe/Gumroad link, or "" |
| desc | string | short description |
| imageUrl | string | from `getDownloadURL()` |
| storagePath | string | `artworks/{timestamp}_{name}.jpg` (used when deleting) |
| isNew | bool | true = shown in the "New Works, Coming Soon" slots first |
| createdAt | timestamp | `serverTimestamp()`; the site sorts newest first |

Android upload flow: upload the file to Storage at `artworks/{System.currentTimeMillis()}_{name}.jpg`, using `contentType` `image/*` and keeping it under 10MB (the Storage rules enforce both). Call `downloadUrl`, then `add()` the document above. To register the Android app, go to Firebase console → Project settings → Add app → Android, package `com.katiedesigns.app`, and add `google-services.json`. Signing in uses the same Email/Password owner account.
