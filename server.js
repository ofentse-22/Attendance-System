// ===============================
// IMPORT MODULES
// ===============================
const express = require('express');
const fs = require('fs');
const startTestCron = require('./src/jobs/testCron');

const app = express();
const PORT = 3000;

// ===============================
// LOGGING FUNCTION
// ===============================
// Writes logs into attendance.log
function writeLog(message) {
  const log = `${new Date().toISOString()} [INFO]: ${message}\n`;
  fs.appendFileSync('attendance.log', log); 
}
// ===============================
// SESSION (FAKE DATA FOR TESTING)
// ===============================
// We use a function so we can reset the session easily
function createNewSession() {
  return {
    status: 'scheduled',               // scheduled -> open -> closed
    startTime: Date.now() + 10000,     // opens in 10 seconds
    cutoffTime: Date.now() + 30000,    // closes in 30 seconds
    students: ['S001', 'S002', 'S003', 'S004'], // class list
    present: new Set()                 // who attended
  };
}

let session = createNewSession();

// Start the automation cron job
let stopTestCron = startTestCron(writeLog, session);

// ===============================
// ROUTES
// ===============================
app.get('/', (req, res) => {
  writeLog('Home page was visited');
  res.send('Attendance System Running');
});

// Mark attendance (ONLY when session is OPEN)
// Example: /attendance?studentId=S001
app.get('/attendance', (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    writeLog('Attendance failed: Missing studentId');
    return res.status(400).send('Missing studentId. Example: /attendance?studentId=S001');
  }

  // Only allow attendance during OPEN session
  if (session.status !== 'open') {
    writeLog(`Rejected: ${studentId} tried attendance while session is ${session.status}`);
    return res.status(403).send(`Attendence not found. Session is ${session.status}`);
  }

  // Check student exists in class list
  if (!session.students.includes(studentId)) {
    writeLog(`Rejected: ${studentId} not found in class list`);
    return res.status(404).send('Student not found in class list');
  }

  // Prevent duplicates automatically using Set
  if (session.present.has(studentId)) {
    writeLog(`Duplicate attempt blocked : ${studentId}`);
    return res.status(409).send('Duplicate attendance attempt blocked');
  }

  session.present.add(studentId);
  writeLog(`Marked PRESENT: ${studentId}`);
  res.send(`Marked present: ${studentId}`);
});

// Check session status
app.get('/session-status', (req, res) => {
  res.json({
    status: session.status,
    startTime: new Date(session.startTime).toISOString(),
    cutoffTime: new Date(session.cutoffTime).toISOString(),
    presentStudents: Array.from(session.present)
  });
});

// Reset session so you can test again without restarting server
app.get('/reset-session', (req, res) => {
  stopTestCron();
  session = createNewSession();

  stopTestCron = startTestCron(writeLog, session);

  writeLog('Session reset (new scheduled session created)');
  res.send('Session reset. It will open in 10 seconds and close in 30 seconds.');
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  writeLog(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});