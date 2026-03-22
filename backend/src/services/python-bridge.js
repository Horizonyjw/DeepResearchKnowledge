const { spawn } = require("child_process");

const START_MARKER = "__CODEx_BRIDGE_START__";
const END_MARKER = "__CODEx_BRIDGE_END__";

function extractMarkedContent(stdout) {
  const start = stdout.lastIndexOf(START_MARKER);
  const end = stdout.lastIndexOf(END_MARKER);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Bridge output markers not found");
  }

  return stdout.slice(start + START_MARKER.length, end).trim();
}

function runPython({ cwd, code, args = [], timeoutMs = 20000, env = {} }) {
  return new Promise((resolve, reject) => {
    const child = spawn("python", ["-c", code, ...args], {
      cwd,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        ...env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);

      if (timedOut) {
        return reject(new Error(`Python process timed out after ${timeoutMs}ms`));
      }

      if (code !== 0) {
        return reject(new Error(stderr || `Python exited with code ${code}`));
      }

      resolve({ stdout, stderr });
    });
  });
}

async function runPythonJson(options) {
  const { stdout } = await runPython(options);
  const content = extractMarkedContent(stdout);
  return JSON.parse(content);
}

async function runPythonText(options) {
  const { stdout } = await runPython(options);
  return extractMarkedContent(stdout);
}

module.exports = {
  START_MARKER,
  END_MARKER,
  runPython,
  runPythonJson,
  runPythonText,
};
