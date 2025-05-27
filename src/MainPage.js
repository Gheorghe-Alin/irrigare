import React, { useState, useEffect } from "react";
import axios from "axios";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const devices = ["esp1", "esp2"];

function MainPage({ onLogout }) {
  const [deviceId, setDeviceId] = useState("esp1");
  const [day, setDay] = useState("monday");
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [interval, setInterval] = useState(10);
  const [schedules, setSchedules] = useState([]);
  const [valveStates, setValveStates] = useState(Array(16).fill(false));

  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules");
    setSchedules(res.data);
  };

  const fetchManualStates = async () => {
    try {
      const res = await axios.get(`/api/manual-control?id=${deviceId}`);
      setValveStates(res.data.valveStates);
    } catch (err) {
      console.error("Eroare la preluarea stărilor manuale:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/schedule", {
        deviceId,
        day,
        hour,
        minute,
        interval,
      });

      if (res.status === 200 && res.data.success) {
        alert("✅ Programare salvată!");
        fetchSchedules();
      } else {
        alert("⚠️ Eroare la salvare.");
      }
    } catch (error) {
      alert("❌ Eroare la conectare.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi această programare?")) return;

    try {
      await axios.delete(`/api/schedule?id=${id}`);
      fetchSchedules();
    } catch (err) {
      alert("Eroare la ștergere.");
      console.error(err);
    }
  };

  const toggleActive = async (id, newState) => {
    try {
      await axios.patch(`/api/schedule?id=${id}`, { active: newState });
      fetchSchedules();
    } catch (err) {
      alert("Eroare la actualizare.");
      console.error(err);
    }
  };

  const updateValveState = async (index, newState) => {
    const updatedStates = [...valveStates];
    updatedStates[index] = newState;
    setValveStates(updatedStates);

    try {
      await axios.post("/api/manual-control", {
        deviceId: deviceId,
        valveStates: updatedStates,
      });
    } catch (err) {
      alert("Eroare la actualizarea valvei.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchManualStates();
  }, [deviceId]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "right" }}>
        <button onClick={onLogout}>Logout</button>
      </div>

      <h2>Programare Udare Valve</h2>

      <div>
        <label>Dispozitiv (ESP32): </label>
        <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          {devices.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Ziua: </label>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Ora: </label>
        <input
          type="number"
          value={hour}
          onChange={(e) => setHour(+e.target.value)}
          min="0"
          max="23"
        />
      </div>

      <div>
        <label>Minut: </label>
        <input
          type="number"
          value={minute}
          onChange={(e) => setMinute(+e.target.value)}
          min="0"
          max="59"
        />
      </div>

      <div>
        <label>Interval per valvă (sec): </label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(+e.target.value)}
        />
      </div>

      <button onClick={handleSubmit}>Salvează Programarea</button>

      <div style={{ marginTop: 40 }}>
        <h3>Programări salvate:</h3>
        {schedules.length === 0 ? (
          <p>Nu există programări.</p>
        ) : (
          <ul>
            {schedules.map((s, i) => (
              <li key={i}>
                <strong>{s.deviceId}</strong>: {s.day}, {s.hour}:
                {s.minute.toString().padStart(2, "0")} → {s.interval}s
                <span
                  style={{ marginLeft: 10, color: s.active ? "green" : "gray" }}
                >
                  [{s.active ? "activă" : "inactivă"}]
                </span>
                <button
                  onClick={() => toggleActive(s._id, !s.active)}
                  style={{ marginLeft: 10 }}
                >
                  {s.active ? "Dezactivează" : "Activează"}
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  style={{ marginLeft: 10 }}
                >
                  Șterge
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <h3>Control Manual Individual (Valve):</h3>
        {valveStates.map((state, index) => (
          <div key={index}>
            Valvă {index + 1}:
            <button
              onClick={() => updateValveState(index, true)}
              disabled={state}
              style={{ marginLeft: 10 }}
            >
              ON
            </button>
            <button
              onClick={() => updateValveState(index, false)}
              disabled={!state}
              style={{ marginLeft: 10 }}
            >
              OFF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
