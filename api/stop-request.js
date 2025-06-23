import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const db = cachedClient.db("relay");
  const collection = db.collection("stop_requests");

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID lipsă" });

  if (req.method === "POST") {
    const { stop } = req.body;
    await collection.updateOne(
      { deviceId: id },
      { $set: { stop: !!stop, updatedAt: new Date() } },
      { upsert: true }
    );
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const doc = await collection.findOne({ deviceId: id });
    return res.status(200).json({ stop: doc?.stop || false });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
