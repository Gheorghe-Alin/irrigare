import React, { useState, useEffect } from "react";
import axios from "axios";

function ManualControl({ deviceId }) {
  const [valves, setValves] = useState(Array(16).fill(false));
  const [loading, setLoading] = useState(false);

  const fetchValves = async () => {
    try {
      const res = await axios.get(`/api/manual-control?id=${deviceId}`);
      console.log("📥 API valveStates:", res.data.valveStates); // DEBUG
      if (Array.isArray(res.data.valveStates)) {
        setValves(res.data.valveStates);
      } else {
        console.warn("⚠️ valveStates lipsă sau invalid:", res.data);
      }
    } catch (err) {
      console.error("❌ Eroare la fetch valveStates:", err);
    }
  };

  const updateValves = async (newState) => {
    setLoading(true);
    try {
      await axios.post(`/api/manual-control`, {
        deviceId,
        valveStates: newState,
      });
      setValves(newState);
    } catch (err) {
      alert("❌ Eroare la actualizare valve.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleValve = (index) => {
    const newState = [...valves];
    newState[index] = !newState[index];
    updateValves(newState);
  };

  useEffect(() => {
    fetchValves();
  }, [deviceId]);

  return (
    <div>
      <h3>Control Manual Valve - {deviceId}</h3>
      {valves.map((v, i) => (
        <div key={i}>
          Valva {i + 1}:
          <input
            type="checkbox"
            checked={v}
            onChange={() => toggleValve(i)}
            disabled={loading}
          />
          <span style={{ marginLeft: 10 }}>({v ? "Pornită" : "Oprită"})</span>
        </div>
      ))}
    </div>
  );
}

export default ManualControl;
