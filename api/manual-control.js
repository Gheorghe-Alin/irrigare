import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const db = cachedClient.db("relay");
  const collection = db.collection("manual_control");

  if (req.method === "POST") {
    const { deviceId, valveStates } = req.body;

    if (!deviceId || !Array.isArray(valveStates) || valveStates.length !== 16) {
      return res.status(400).json({ error: "Date invalide" });
    }

    await collection.updateOne(
      { deviceId },
      { $set: { valveStates, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID lipsă" });

    const doc = await collection.findOne({ deviceId: id });
    return res.status(200).json({ valveStates: doc?.valveStates || Array(16).fill(false) });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
