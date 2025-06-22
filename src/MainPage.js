import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MainPage.css";

const days = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday"
];
const devices = ["esp1", "esp2"];

function MainPage({ onLogout }) {
  // ───────────────────────────────────────────────────────── state
  const [deviceId,   setDeviceId]   = useState("esp1");
  const [day,        setDay]        = useState("monday");
  const [hour,       setHour]       = useState(12);
  const [minute,     setMinute]     = useState(0);
  const [interval,   setInterval]   = useState(10);
  const [schedules,  setSchedules]  = useState([]);
  const [valveStates,setValveStates]= useState(Array(16).fill(false));

  // ─────────────────────────────── helpers (API)
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/schedules");
      setSchedules(res.data);
    } catch (err) { console.error("Eroare la încărcarea programărilor:", err); }
  };

  const fetchManualStates = async () => {
    try {
      const res = await axios.get(`/api/manual-control?id=${deviceId}`);
      setValveStates(res.data.valveStates);
    } catch (err) { console.error("Eroare la preluarea stărilor manuale:", err); }
  };

  // ─────────────────────────────── create schedule
  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/schedule", {
        deviceId, day, hour, minute, interval,
      });
      if (res.status === 200 && res.data.success) {
        alert("✅ Programare salvată!");
        fetchSchedules();
      } else {
        alert("⚠️  Eroare la salvare.");
      }
    } catch (error) { alert("❌ Eroare la conectare."); }
  };

  // ─────────────────────────────── delete schedule
  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi această programare?")) return;
    try {
      await axios.delete(`/api/schedule?id=${id}`);
      fetchSchedules();
    } catch (err) { alert("Eroare la ștergere."); }
  };

  // ─────────────────────────────── toggle active
  const toggleActive = async (id, newState) => {
    try {
      await axios.patch(`/api/schedule?id=${id}`, { active: newState });
      fetchSchedules();
    } catch (err) { alert("Eroare la actualizare."); }
  };

  // ─────────────────────────────── toggle one valve manually
  const updateValveState = async (index, newState) => {
    const updated = [...valveStates];
    updated[index] = newState;
    setValveStates(updated);
    try {
      await axios.post("/api/manual-control", {
        deviceId, valveStates: updated,
      });
    } catch (err) { alert("Eroare la actualizarea valvei."); }
  };

  // ─────────────────────────────── STOP PROGRAM (setează toate valvele false)
  const stopProgram = async () => {
    const allOff = Array(16).fill(false);
    setValveStates(allOff);
    try {
      await axios.post("/api/manual-control", {
        deviceId, valveStates: allOff,
      });
      alert("🛑 Programul curent va fi oprit (toate valvele OFF).");
    } catch (err) { alert("Eroare la trimiterea comenzii."); }
  };

  // ───────────────────────────────────────────────────────── effects
  useEffect(() => {
    fetchSchedules();
    fetchManualStates();
  }, [deviceId]);

  // ───────────────────────────────────────────────────────── UI
  return (
    <div className="container">

      <div style={{ textAlign: "right" }}>
        <button onClick={onLogout} className="button">Logout</button>
      </div>

      <h2 className="title">Programare Udare Valve</h2>

      {/* ╔═══════════════ Form programare ═══════════════ */}
      <div className="section form">
        <label className="label">Dispozitiv:
          <select value={deviceId}
                  onChange={e => setDeviceId(e.target.value)}
                  className="input">
            {devices.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label className="label">Ziua:
          <select value={day}
                  onChange={e => setDay(e.target.value)}
                  className="input">
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label className="label">Ora:
          <input type="number" min="0" max="23"
                 value={hour}
                 onChange={e => setHour(+e.target.value)}
                 className="input" />
        </label>

        <label className="label">Minut:
          <input type="number" min="0" max="59"
                 value={minute}
                 onChange={e => setMinute(+e.target.value)}
                 className="input" />
        </label>

        <label className="label">Interval (sec.):
          <input type="number"
                 value={interval}
                 onChange={e => setInterval(+e.target.value)}
                 className="input" />
        </label>

        <button onClick={handleSubmit} className="button save">
          Salvează Programarea
        </button>
      </div>

      {/* ╔═══════════════ Lista programări ═══════════════ */}
      <div className="section">
        <h3 className="title">Programări salvate</h3>
        {schedules.length === 0
          ? <p>Nu există programări.</p>
          : <ul>
              {schedules.map(s => (
                <li key={s._id}>
                  <strong>{s.deviceId}</strong> – {s.day},
                  {` ${s.hour}:${s.minute.toString().padStart(2,"0")} → ${s.interval}s `}

                  <span className={s.active ? "active" : "inactive"}>
                    [{s.active ? "activă" : "inactivă"}]
                  </span>

                  <button onClick={() => toggleActive(s._id, !s.active)}
                          className="button">
                    {s.active ? "Dezactivează" : "Activează"}
                  </button>
                  <button onClick={() => handleDelete(s._id)}
                          className="button delete">
                    Șterge
                  </button>
                </li>
              ))}
            </ul>}
      </div>

      {/* ╔═══════════════ Control manual & Stop ═══════════════ */}
      <div className="section">
        <h3 className="title">Control Manual Valve</h3>

        <button onClick={stopProgram}
                style={{ marginBottom: 15 }}
                className="button stop">
          🛑 Stop program în curs
        </button>

        {valveStates.map((state, i) => (
          <div key={i} className="valve-row">
            Valvă {i + 1}:
            <button onClick={() => updateValveState(i, true)}
                    disabled={state}
                    className="button on">ON</button>
            <button onClick={() => updateValveState(i, false)}
                    disabled={!state}
                    className="button off">OFF</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
