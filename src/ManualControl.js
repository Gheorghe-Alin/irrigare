import React, { useState, useEffect } from "react";
import axios from "axios";

function ManualControl({ deviceId }) {
  const [valves, setValves] = useState(Array(16).fill(false));
  const [loading, setLoading] = useState(false);

  const fetchValves = async () => {
    const res = await axios.get(`/api/manual-control?id=${deviceId}`);
    setValves(res.data.valves);
  };

  const updateValves = async (newState) => {
    setLoading(true);
    try {
      await axios.post(`/api/manual-control?id=${deviceId}`, {
        valves: newState,
      });
      setValves(newState);
    } catch (err) {
      alert("Eroare la actualizare valve.");
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
  }, []);

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
        </div>
      ))}
    </div>
  );
}

export default ManualControl;
