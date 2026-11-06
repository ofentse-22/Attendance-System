function startTestCron(writeLog, session) {
  const openTimer = setTimeout(() => {
    if (session.status !== 'scheduled') {
      return;
    }

    session.status = 'open';
    writeLog('Attendance session is now open');
  }, Math.max(0, session.startTime - Date.now()));

  const closeTimer = setTimeout(() => {
    if (session.status === 'closed') {
      return;
    }

    session.status = 'closed';
    writeLog('Attendance session is now closed');
  }, Math.max(0, session.cutoffTime - Date.now()));

  return function stopTestCron() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  };
}

module.exports = startTestCron;
