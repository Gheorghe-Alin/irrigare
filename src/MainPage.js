import React, { useState, useEffect } from "react";
import axios from "axios";

const days = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday"
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

  useEffect(() => {
    fetchSchedules();
    fetchManualStates();
  }, [deviceId]);

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
      setValveStates(res.data.valveStates);
    } catch (err) {
      console.error("Eroare la preluarea stărilor manuale:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/schedule", {
        deviceId, day, hour, minute, interval,
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
      alert("Eroare la actualizarea valvei.");
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-hidden space-y-4 py-7">
      <div className="relative h-full shadow-xl pt-4 pb-10 flex flex-col gap-8 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 text-gray-900 dark:text-white overflow-y-auto max-h-[90vh] ml-10 mr-10 rounded-2xl transition-colors duration-500 px-6">
        
        {/* Logout */}
        <div className="flex justify-end">
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>

        {/* Titlu */}
        <h2 className="text-3xl font-bold text-center">Programare Udare Valve</h2>

        {/* Formular */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-semibold">Dispozitiv:</label>
            <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800">
              {devices.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Ziua:</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800">
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Ora:</label>
            <input type="number" value={hour} onChange={(e) => setHour(+e.target.value)} min="0" max="23" className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Minut:</label>
            <input type="number" value={minute} onChange={(e) => setMinute(+e.target.value)} min="0" max="59" className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Interval (sec):</label>
            <input type="number" value={interval} onChange={(e) => setInterval(+e.target.value)} className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
          Salvează Programarea
        </button>

        {/* Programări Salvate */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Programări salvate:</h3>
          {schedules.length === 0 ? (
            <p>Nu există programări.</p>
          ) : (
            <ul className="space-y-4">
              {schedules.map((s, i) => (
                <li key={i} className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong>{s.deviceId}</strong>: {s.day}, {s.hour}:{s.minute.toString().padStart(2, "0")} → {s.interval}s
                    <span className={`ml-4 px-2 py-1 text-sm rounded-full ${s.active ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}>
                      {s.active ? "activă" : "inactivă"}
                    </span>
                  </div>
                  <div className="mt-2 md:mt-0 space-x-2">
                    <button onClick={() => toggleActive(s._id, !s.active)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                      {s.active ? "Dezactivează" : "Activează"}
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                      Șterge
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Control Manual - Toggle */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Control Manual Individual (Valve):</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {valveStates.map((state, index) => (
              <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow flex items-center justify-between">
                <span className="font-semibold">Valvă {index + 1}</span>
                <button
                  onClick={() => updateValveState(index, !state)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
                    state ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      state ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
