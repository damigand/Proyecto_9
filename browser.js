const puppeteer = require('puppeteer');

async function startBrowser() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized'],
            defaultViewport: null,
        });
    } catch (error) {
        console.log(`Error creating browser instance: ${error}`);
    }

    return browser;
}

module.exports = { startBrowser };
