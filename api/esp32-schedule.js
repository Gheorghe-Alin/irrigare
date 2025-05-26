import moment from "moment-timezone";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing device ID in query" });
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("schedules");

    const now = moment().tz("Europe/Bucharest");
    const currentDay = now.format("dddd").toLowerCase();
    const hour = now.hour();
    const minute = now.minute();

    const active = await collection.findOne({
      deviceId: id.toLowerCase(),
      day: currentDay,
      hour,
      minute,
      active: true,
    });

    res.status(200).json(active || {});
  } catch (err) {
    res.status(500).json({ error: "Eroare MongoDB", details: err.message });
  }
}
