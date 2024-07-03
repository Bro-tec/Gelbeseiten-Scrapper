const puppeteer = require('puppeteer');
const commands = require('./Commands');
const waitForUserInput = require('wait-for-user-input');

let url = "https://www.gelbeseiten.de/";

(async () => {
    let height = 1080, width = 1620;

    const browser = await puppeteer.launch({
        'Accept-Charset': 'utf-8',
        'Content-Type': 'text/html; charset=utf-8',
        //ignoreDefaultArgs: true,
        headless: false,

        args: [
            '--start-maximized',
            '--no-sandbox',
            '--ignoreHTTPSErrors',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-infobars',
            '--window-position=0,0',
            `--window-size=${width},${height}`,
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Chrome/97.0.4692.45 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36"',
            '--enable-background-networking',
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--enable-client-side-phishing-detection',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--enable-scrollbars',
            '--remote-debugging-port=0',
        ]
    });
    const pid1 = await browser.process().pid;
    //await console.log(browser.browserContexts());
    const page = await browser.pages();
    //let specificpage= [];
    await page[0].setViewport({ width: 1620, height: 1080 });

    await page[0].setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'de;q=0.9,de;q=0.8'
    })


    try {
        await page[0].goto(url, { waitUntil: 'load', timeout: 3000 });
    } catch (e) {
        await console.log("couldnt load\n", e);
        await page[0].waitForTimeout(2000);
    }

    await commands.gelbeSeitencookie(page[0]);

    await commands.gelbeSeiten_enter_adress(page[0], "Copyshops", "Deutschland");
    //await commands.buttonClick(page[0], "Finden") 
    await page[0].waitForTimeout(2000);

    try {
        await commands.klickWeiter(page[0])
    } catch (error) {
        await console.log(error);
    }

    await commands.gelbeSeiten_findElements(page[0]);

    let input = await waitForUserInput("klick weiter zum starten");
    await commands.EndChrome(pid1);
    await process.exit();
})();