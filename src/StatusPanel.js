
import React, { useEffect, useState } from "react";
import axios from "axios";

function StatusPanel({ deviceId }) {
  const [status, setStatus] = useState("verific...");

  const checkStatus = async () => {
    try {
      const res = await axios.get(`/api/esp32-schedule?id=${deviceId}`);
      if (res.data && res.data.interval) {
        setStatus("🟠 Automat activ");
      } else {
        const manual = await axios.get(`/api/manual-control?id=${deviceId}`);
        const anyOn = manual.data.valves?.some((v) => v === true);
        if (anyOn) {
          setStatus("🟢 Control manual activ");
        } else {
          setStatus("⚪ Inactiv");
        }
      }
    } catch (err) {
      setStatus("❌ Eroare conexiune");
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // actualizare la 10 sec
    return () => clearInterval(interval);
  }, [deviceId]);

  return (
    <div style={{ padding: 10, border: "1px solid #ccc", marginBottom: 20 }}>
      <strong>Stare dispozitiv ({deviceId}):</strong> <span>{status}</span>
    </div>
  );
}

export default StatusPanel;
