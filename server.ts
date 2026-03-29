import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
admin.initializeApp({
  projectId: "gen-lang-client-0788220164",
});

const db = admin.firestore();
const auth = admin.auth();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin middleware
  const verifyAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      // Hardcoded admin check based on user request
      if (decodedToken.email !== "peterpaskartolg@gmail.com") {
        return res.status(403).json({ error: "Forbidden: Admin access only" });
      }
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/admin/delete-all-users", verifyAdmin, async (req, res) => {
    try {
      console.log("Admin starting deletion of all users...");
      
      // 1. List all users from Firebase Auth
      const listAllUsers = async (nextPageToken?: string) => {
        const result = await auth.listUsers(1000, nextPageToken);
        const usersToDelete = result.users
          .filter(u => u.email !== "peterpaskartolg@gmail.com") // Keep the admin
          .map(u => u.uid);

        if (usersToDelete.length > 0) {
          await auth.deleteUsers(usersToDelete);
          console.log(`Deleted ${usersToDelete.length} auth users.`);
        }

        if (result.pageToken) {
          await listAllUsers(result.pageToken);
        }
      };

      await listAllUsers();

      // 2. Delete Firestore documents (users_public, users_private)
      const collections = ["users_public", "users_private"];
      for (const collName of collections) {
        const snapshot = await db.collection(collName).get();
        const batch = db.batch();
        let count = 0;
        snapshot.docs.forEach((doc) => {
          if (doc.id !== req.user.uid) { // Keep admin's data
            batch.delete(doc.ref);
            count++;
          }
        });
        if (count > 0) {
          await batch.commit();
          console.log(`Deleted ${count} documents from ${collName}.`);
        }
      }

      res.json({ success: true, message: "All users (except admin) have been deleted." });
    } catch (error: any) {
      console.error("Error in delete-all-users:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
