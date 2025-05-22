import { MongoClient } from 'mongodb';

// Reutilizăm conexiunea pentru performanță în Vercel
const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  try {
    // Conectare MongoDB o singură dată
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db('relay');
    const collection = db.collection('schedules');

    // Ora actuală în fusul orar România
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('ro-RO', { weekday: 'long' });
    const currentDay = formatter.format(now).toLowerCase(); // Ex: joi
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 🔎 Debug (opțional)
    console.log("📅 Server time:", currentDay, hour + ":" + minute);

    // Caută programare în fereastra de ±1 minut
    const active = await collection.findOne({
      day: currentDay,
      hour,
      minute: { $in: [minute - 1, minute, minute + 1] }
    });

    if (active) {
      res.status(200).json(active);
    } else {
      res.status(200).json({}); // fără programare activă
    }

  } catch (err) {
    console.error("❌ Eroare în esp32-schedule.js:", err);
    res.status(500).json({ error: 'Eroare MongoDB', details: err.message });
  }
}
