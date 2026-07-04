import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { createServer } from "vite"

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const host = "127.0.0.1"
const port = 4180
const baseURL = `http://${host}:${port}`
let server

function runPlaywright() {
  const playwrightCli = resolve(
    appRoot,
    "node_modules",
    "@playwright",
    "test",
    "cli.js",
  )

  return new Promise((resolveExitCode, reject) => {
    const child = spawn(
      process.execPath,
      [playwrightCli, "test", "--config", "playwright.config.js"],
      {
        cwd: appRoot,
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: baseURL,
        },
        stdio: "inherit",
      },
    )

    child.on("error", reject)
    child.on("exit", (code, signal) => {
      resolveExitCode(code ?? (signal ? 1 : 0))
    })
  })
}

try {
  server = await createServer({
    root: appRoot,
    configFile: resolve(appRoot, "vite.config.js"),
    server: {
      host,
      port,
      strictPort: true,
    },
  })

  await server.listen()
  console.log(`Playwright E2E server ready at ${baseURL}`)

  process.exitCode = await runPlaywright()
} finally {
  if (server) {
    await server.close()
  }
}
