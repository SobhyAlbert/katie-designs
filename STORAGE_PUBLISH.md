# After upgrading katie-designs to Blaze (only remaining step)
1. Firebase Console > Storage > Get started (creates bucket katie-designs.firebasestorage.app).
2. Publish rules (one step), from /workspace/katie-designs:
   firebase deploy --only storage --project katie-designs   (firebase.json added locally)
   (or paste storage.rules into Console > Storage > Rules > Publish)
storage.rules already allows public read and owner (CQujCJMlRfP8nG5lAlwYVeo69OH2) writes of images <10MB under artworks/**.
