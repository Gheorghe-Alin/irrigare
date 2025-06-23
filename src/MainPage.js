import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MainPage.css";

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
    try {
      const res = await axios.get("/api/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error("Eroare la încărcarea programărilor:", err);
    }
  };

  const fetchManualStates = async () => {
    try {
      const res = await axios.get(`/api/manual-control?id=${deviceId}`);
      console.log("📥 valveStates primite:", res.data.valveStates); // DEBUG
      if (Array.isArray(res.data.valveStates)) {
        setValveStates(res.data.valveStates);
      } else {
        console.warn("⚠️ valveStates lipsă sau invalid:", res.data);
      }
    } catch (err) {
      console.error("Eroare la preluarea stărilor manuale:", err);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`/api/reset?id=${deviceId}`);
      alert(`♻️ Reset trimis pentru ${deviceId}`);
    } catch (err) {
      alert("❌ Eroare la resetare");
      console.error(err);
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
        deviceId,
        valveStates: updatedStates,
      });
    } catch (err) {
      alert("❌ Eroare la actualizarea valvei.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchManualStates();
  }, [deviceId]);

  return (
    <div className="container">
      <div style={{ textAlign: "right" }}>
        <button onClick={onLogout} className="button">
          Logout
        </button>
      </div>

      <h2 className="title">Programare robineți</h2>

      <div className="section">
        <div style={{ marginBottom: "10px" }}>
          <button onClick={handleReset} className="button">
            ♻️ Reset ESP curent
          </button>
        </div>

        <div>
          <label className="label">Dispozitiv:</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="input"
          >
            {devices.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Ziua:</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="input"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Ora:</label>
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(+e.target.value)}
            min="0"
            max="23"
            className="input"
          />
        </div>

        <div>
          <label className="label">Minut:</label>
          <input
            type="number"
            value={minute}
            onChange={(e) => setMinute(+e.target.value)}
            min="0"
            max="59"
            className="input"
          />
        </div>

        <div>
          <label className="label">Interval (sec):</label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(+e.target.value)}
            className="input"
          />
        </div>

        <button onClick={handleSubmit} className="button">
          Salvează programarea
        </button>
      </div>

      <div className="section">
        <h3 className="title">Programări salvate:</h3>
        {schedules.length === 0 ? (
          <p>Nu există programări.</p>
        ) : (
          <ul>
            {schedules.map((s, i) => (
              <li key={i}>
                <strong>{s.deviceId}</strong>: {s.day}, {s.hour}:
                {s.minute.toString().padStart(2, "0")} → {s.interval}s
                <span
                  className={s.active ? "active" : "inactive"}
                  style={{ marginLeft: 10 }}
                >
                  [{s.active ? "activă" : "inactivă"}]
                </span>
                <button
                  onClick={() => toggleActive(s._id, !s.active)}
                  className="button"
                >
                  {s.active ? "Dezactivează" : "Activează"}
                </button>
                <button onClick={() => handleDelete(s._id)} className="button">
                  Șterge
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h3 className="title">Control manual individual (Robineți):</h3>
        {valveStates.map((state, index) => (
          <div key={index}>
            Valvă {index + 1}:
            <button
              onClick={() => updateValveState(index, true)}
              disabled={state}
              className="button"
            >
              ON
            </button>
            <button
              onClick={() => updateValveState(index, false)}
              disabled={!state}
              className="button"
            >
              OFF
            </button>
            <span style={{ marginLeft: 10, fontWeight: 500 }}>
              ({state ? "Pornită" : "Oprită"})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
