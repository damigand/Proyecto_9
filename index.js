const { startBrowser } = require('./browser');
const fs = require('fs');
const scraper = require('./pageScraper');

const browserPromise = startBrowser();

//Cambiar esta variable en base a lo que quieras buscar
const search = 'Coca Cola';

browserPromise.then(async (browser) => {
    const data = await scraper.scrape(browser, search);
    const jsonData = JSON.stringify(data, null, 3);

    fs.writeFile('./products.json', jsonData, (err) => {
        if (err) {
            console.log(`Error writing data to JSON file: `, err);
        } else {
            console.log('Data scucessfully written to products.json');
        }
    });

    browser.close();
});
