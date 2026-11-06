# Attendance System

A small Express-based attendance-session demo. The server keeps a test class list
and attendance records in memory, automatically opens a session 10 seconds after
startup (or reset), and closes it 30 seconds after startup (or reset).

## Requirements

- Node.js 18 or newer
- npm

## Run locally

From this directory, install dependencies and start the server:

```sh
npm install
npm start
```

The server listens on port `3000`. Visit <http://localhost:3000/> to check that
it is running. It appends activity to `attendance.log` in the current working
directory.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health check; returns `Attendance System Running`. |
| `GET` | `/session-status` | Returns the session state, its start and cutoff times, and present student IDs. |
| `GET` | `/attendance?studentId=S001` | Marks a listed student present while the session is open. Test IDs are `S001` through `S004`. |
| `GET` | `/reset-session` | Starts a fresh session and its 10-second/30-second schedule. |

Attendance requests are rejected if the session is not open, the student ID
isn't on the test list, or that student has already been marked present. The
server responds with HTTP `403`, `404`, and `409` respectively; a missing
`studentId` returns `400`.

## Try it

1. Start the server.
2. Check `/session-status`; the session initially reports `scheduled`.
3. After about 10 seconds, request `/attendance?studentId=S001`.
4. Request the same URL again to see the duplicate check.
5. Check `/session-status` to see the recorded student.
6. Use `/reset-session` to start another test session.

## Limitations

This is a local demo, not a production attendance service. Student IDs are
sample data and are not authenticated; records are held in memory and disappear
when the server restarts. The reset endpoint is also intentionally unauthenticated.
