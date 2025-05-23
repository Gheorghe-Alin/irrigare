import moment from "moment-timezone";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("relay");
    const collection = db.collection("schedules");

    const now = moment().tz("Europe/Bucharest");
    const currentDay = now.format("dddd").toLowerCase(); // ex: friday
    const hour = now.hour();
    const minute = now.minute();

    console.log("📅 Time Romania:", currentDay, hour + ":" + minute);

    const active = await collection.findOne({
      day: currentDay,
      hour,
      minute: { $in: [minute - 1, minute, minute + 1] },
    });

    if (active) {
      res.status(200).json(active);
    } else {
      res.status(200).json({});
    }
  } catch (err) {
    res.status(500).json({ error: "Eroare MongoDB", details: err.message });
  }
}
