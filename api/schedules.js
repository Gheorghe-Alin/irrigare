import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("schedules");
    const schedules = await collection.find({}).sort({ _id: -1 }).toArray();

    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ error: "Eroare MongoDB", details: err.message });
  }
}
