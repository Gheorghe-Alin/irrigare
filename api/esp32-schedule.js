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

    // Ora României, ziua în engleză (ex: friday)
    const now = moment().tz("Europe/Bucharest");
    const currentDay = now.format("dddd").toLowerCase(); // monday, tuesday, ...
    const hour = now.hour();
    const minute = now.minute();

    console.log("🕒 [Romania] Server time:", currentDay, hour + ":" + minute);

    // Căutare cu potrivire exactă
    const active = await collection.findOne({
      day: currentDay,
      hour: hour,
      minute: minute,
    });

    if (active) {
      res.status(200).json(active);
    } else {
      res.status(200).json({});
    }
  } catch (err) {
    console.error("❌ ESP32 Schedule Error:", err);
    res.status(500).json({ error: "Eroare MongoDB", details: err.message });
  }
}
