import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "ID lipsă" });

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("esp_resets");

    if (req.method === "POST") {
      await collection.updateOne(
        { deviceId: id },
        { $set: { reset: true } },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === "GET") {
      const doc = await collection.findOne({ deviceId: id });
      const shouldReset = doc?.reset || false;

      if (shouldReset) {
        await collection.updateOne(
          { deviceId: id },
          { $set: { reset: false } }
        );
      }

      return res.status(200).json({ reset: shouldReset });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    res.status(500).json({ error: "Eroare MongoDB", details: err.message });
  }
}
