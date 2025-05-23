import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { deviceId, day, hour, minute, interval } = req.body;

  if (
    !deviceId ||
    !day ||
    typeof hour !== "number" ||
    typeof minute !== "number" ||
    typeof interval !== "number" ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    interval <= 0
  ) {
    return res.status(400).json({ error: "Date incomplete sau invalide" });
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("schedules");

    const result = await collection.insertOne({
      deviceId: deviceId.toLowerCase(),
      day: day.toLowerCase(),
      hour,
      minute,
      interval,
    });

    res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Eroare MongoDB", details: err.message });
  }
}
