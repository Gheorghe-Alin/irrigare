import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db('relay');
    const collection = db.collection('schedules');

    // ✅ POST – creează programare
    if (req.method === 'POST') {
      const { deviceId, day, hour, minute, interval } = req.body;

      if (
        !deviceId || !day ||
        typeof hour !== 'number' ||
        typeof minute !== 'number' ||
        typeof interval !== 'number'
      ) {
        return res.status(400).json({ error: 'Date incomplete' });
      }

      const result = await collection.insertOne({
        deviceId: deviceId.toLowerCase(),
        day: day.toLowerCase(),
        hour,
        minute,
        interval,
        active: true,
        temporaryDisabled: false // nou
      });

      return res.status(200).json({ success: true, id: result.insertedId });
    }

    // 🗑️ DELETE – șterge programare
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID lipsă' });

      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    // ✏️ PATCH – active sau temporaryDisabled
    if (req.method === 'PATCH') {
      const { id } = req.query;
      const { active, temporaryDisabled } = req.body;

      if (!id) return res.status(400).json({ error: 'ID lipsă' });

      const updateFields = {};
      if (typeof active === 'boolean') updateFields.active = active;
      if (typeof temporaryDisabled === 'boolean') updateFields.temporaryDisabled = temporaryDisabled;

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Nicio actualizare validă' });
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );

      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: "Method Not Allowed" });

  } catch (err) {
    res.status(500).json({ error: 'Eroare MongoDB', details: err.message });
  }
}
