const scraper = {
    url: 'https://www.vidalgolosinas.com/',

    async scrape(browser, search) {
        let page = await browser.newPage();
        await page.goto(this.url);

        const cookieId = '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll';
        await page.waitForSelector(cookieId);
        await page.click(cookieId);

        const searchDiv = '.search-container.control';
        await page.type(`${searchDiv} .input-search`, search);
        setTimeout(async function () {
            await page.waitForSelector(`${searchDiv} .btn-search`);
            await page.click(`${searchDiv} .btn-search`);
        }, 200);

        const productsDiv = '.products-content .products .products-container';

        let scrapedData = [];

        async function scrapeProducts() {
            await page.waitForSelector(productsDiv);

            let products = await page.$$(`${productsDiv} > .product-box`, (result) => {
                result = result.map((a) => a.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, ''));
                return result;
            });

            let productPromise = (product) =>
                new Promise(async (resolve, reject) => {
                    let prodObj = {};
                    prodObj['title'] = await product.$eval('.datos > .name > a', (text) => text.textContent.trim());
                    prodObj['img'] = await product.$eval('.image .product-image', (img) => img.getAttribute('data-src'));
                    prodObj['price'] = await product.$eval('.datos span.price > span.price', (text) => text.textContent.trim());

                    //try-catch para los elementos que a veces faltan (ya que puppeteer lanza un error con $eval).
                    //formato (unidades, kilos).
                    try {
                        prodObj['format'] = await product.$eval('.datos .format', (text) => text.textContent.trim());
                    } catch (error) {
                        //producto sin formato.
                    }

                    //tags (sin gluten, sin grasa, etc).
                    try {
                        const tags = await product.$$eval('.etiquetas.normal .tag', (tags) => {
                            //filtramos los tags, los espacios vacíos y los tags vacíos (hay veces que un elemento "tag" no tiene texto)
                            tags = tags.map((tag) => tag.textContent.trim());
                            tags = tags.filter((tag) => tag);
                            return tags;
                        });

                        if (tags.length > 0) prodObj['tags'] = tags;
                    } catch (error) {
                        //Producto sin tags.
                    }

                    resolve(prodObj);
                });

            for (index in products) {
                let currentProductData = await productPromise(products[index]);
                scrapedData.push(currentProductData);
            }

            let next = false;
            try {
                let nextButton = await page.$eval('.pages-item-next > a', (a) => a.textContent);
                next = true;
            } catch (error) {
                next = false;
            }

            if (next) {
                //usamos eval y a => a.click() ya que el botón no está en la pantalla
                await page.$eval('.pages-item-next > a', (a) => a.click());
                return scrapeProducts();
            }

            await page.close();
            return scrapedData;
        }

        let data = await scrapeProducts();
        return data;
    },
};

module.exports = scraper;
