Schedule;
import moment from "moment-timezone";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  const { id, checkOnly } = req.query;
  if (!id) return res.status(400).json({ error: "Missing device ID" });

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("schedules");

    const now = moment().tz("Europe/Bucharest");
    const day = now.format("dddd").toLowerCase();
    const hour = now.hour();
    const minute = now.minute();

    const filter = {
      deviceId: id.toLowerCase(),
      day,
      hour,
      active: true,
    };

    if (checkOnly !== "true") {
      filter.minute = { $gte: minute }; // ⬅️ doar în sus!
    }

    const match = await collection.findOne(filter);
    res.status(200).json(match || {});
  } catch (err) {
    res.status(500).json({ error: "MongoDB Error", details: err.message });
  }
}
