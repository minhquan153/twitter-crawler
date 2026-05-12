require("dotenv").config();

const { launchBrowser } = require("../src/crawler/browser");

async function main() {
  const browser = await launchBrowser({ headless: false });

  try {
    const page = await browser.newPage();
    await page.goto("https://x.com/login", {
      waitUntil: "domcontentloaded",
    });

    console.log("Chrome opened. Login to X/Twitter, then close the browser manually.");
  } catch (error) {
    await browser.close();
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
