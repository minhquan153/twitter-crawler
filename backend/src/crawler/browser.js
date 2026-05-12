const puppeteer = require("puppeteer-core");

async function launchBrowser(options = {}) {
  const executablePath = process.env.CHROME_EXECUTABLE_PATH;
  const userDataDir = process.env.PUPPETEER_USER_DATA_DIR;

  if (!executablePath) {
    throw new Error("CHROME_EXECUTABLE_PATH is not configured");
  }

  if (!userDataDir) {
    throw new Error("PUPPETEER_USER_DATA_DIR is not configured");
  }

  return puppeteer.launch({
    executablePath,
    userDataDir,
    headless: options.headless ?? false,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
    ],
  });
}

module.exports = {
  launchBrowser,
};
