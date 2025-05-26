import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Lipsesc datele de autentificare" });
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("users");

    const user = await collection.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Autentificare eșuată" });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Eroare server", details: err.message });
  }
}
