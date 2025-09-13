import fs from 'fs';
import path from 'path';

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function getCallerInfo() {
  const err = new Error();
  const stack = err.stack?.split('\n');

  // stack[0] = Error
  // stack[1] = at logError ...
  // stack[2] = at actual caller
  const callerLine = stack[3] || stack[2];

  // Example format: "    at login (src/controllers/authController.js:23:15)"
  const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
                callerLine.match(/at\s+(.*):(\d+):(\d+)/);

  if (match) {
    return {
      functionName: match[1],
      filePath: match[2] || '',
      line: match[3],
      column: match[4],
    };
  }
  return {};
}

export const logError = (error) => {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const logFile = path.join(logDir, `${date}.log`);

  const time = now.toISOString();
  const { functionName, filePath, line, column } = getCallerInfo();

  const message = `[${time}] [${functionName || 'anonymous'} @ ${filePath}:${line}:${column}] ${error.stack || error}\n`;

  fs.appendFileSync(logFile, message, 'utf8');
};
