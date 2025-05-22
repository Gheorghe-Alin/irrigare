const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

let schedule = {}; // salvează ultima programare

app.use(cors());
app.use(bodyParser.json());

app.post('/api/schedule', (req, res) => {
  schedule = req.body;
  console.log("Programare actualizată:", schedule);
  res.sendStatus(200);
});

app.get('/api/esp32/schedule', (req, res) => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  if (schedule.day === currentDay &&
      now.getHours() === schedule.hour &&
      now.getMinutes() === schedule.minute) {
    res.json(schedule);
  } else {
    res.json({}); // nimic de activat
  }
});

app.listen(port, () => {
  console.log(`Backend rulând la http://localhost:${port}`);
});
