import React, { useState, useEffect } from "react";
import axios from "axios";

function ManualControl({ deviceId }) {
  const [valves, setValves] = useState(Array(16).fill(false));
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchValves = async () => {
    try {
      const res = await axios.get(`/api/manual-control?id=${deviceId}`);
      setValves(res.data.valves);
    } catch (err) {
      setStatusMsg("❌ Eroare la preluarea stării.");
    }
  };

  const updateValves = async (newState) => {
    setLoading(true);
    try {
      await axios.post(`/api/manual-control?id=${deviceId}`, {
        valves: newState,
      });
      setValves(newState);
      setStatusMsg("✅ Stare actualizată cu succes!");
    } catch (err) {
      setStatusMsg("❌ Eroare la actualizare valve.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const toggleValve = (index) => {
    const newState = [...valves];
    newState[index] = !newState[index];
    updateValves(newState);
  };

  useEffect(() => {
    fetchValves();
  }, []);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">
        Control Manual Valve – {deviceId}
      </h3>

      {statusMsg && (
        <div className="mb-4 text-sm text-blue-600 font-medium">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {valves.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="font-medium">
              Valva {i + 1}: ({v ? "Pornită" : "Oprită"})
            </label>
            <input
              type="checkbox"
              checked={v}
              onChange={() => toggleValve(i)}
              disabled={loading}
              className="scale-125"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManualControl;
