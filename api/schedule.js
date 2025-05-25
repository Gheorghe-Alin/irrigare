import { MongoClient, ObjectId } from 'mongodb';

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
        interval
      });

      return res.status(200).json({ success: true, id: result.insertedId });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID lipsă' });

      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Eroare MongoDB', details: err.message });
  }
}
