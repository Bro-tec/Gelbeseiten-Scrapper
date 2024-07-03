
async function deleteInput(page, inp) {
    await page.evaluate((inp) => {
        document.querySelector(inp).value = '';
    }, inp);
}

async function gelbeSeitencookie(page) {
    await mouseClickID(page, "cmpbntsavetxt");
}

async function gelbeSeiten_enter_adress(page, was, wo) {

    await page.waitForSelector('input[name="WAS"]', { visible: true, timeout: 10000 });
    await deleteInput(page, 'input[name="WAS"]');

    await console.log(was + ". wurden eingefuegt");

    await page.waitForSelector('input[name="WO"]', { visible: true, timeout: 10000 });
    await deleteInput(page, 'input[name="WO"]');
    await page.type('input[name="WO"]', wo);
    await console.log(wo + ". wurden eingefuegt");

    await page.waitForTimeout(1000);

    await page.click('button[class="gc-btn gc-btn--black gc-btn--l search_go"]');
}

async function buttonClick(page, txt) {
    let s = await page.evaluate(() => {
        let get1 = document.getElementsByClassName('button');
        for (let element = 0; element < get1.length; element++) {
            if (get1[element].innerHTML == txt) {
                get1[element].click();
                return element;
            }
        }
    });
}

async function gelbeSeiten_findElements(page) {
    let x = await page.evaluate(() => {
        let attribut = document.getElementsByClassName('mod mod-Treffer'), list = [];
        for (let x = 0; x < attribut.length; x++) {
            try {
                let titel = attribut[x].getElementsByClassName('mod-Treffer__name'),
                    adresse = attribut[x].getElementsByClassName('mod-AdresseKompakt__adress-text'),
                    tel = attribut[x].getElementsByClassName('mod-TelefonnummerKompakt'),
                    web = attribut[x].getElementsByClassName('mod-TelefonnummerKompakt');
                let splitted = adresse[0].innerText.split(",");
                let plz = splitted[1].substring(1, 6), stadt = splitted[1].substring(7, splitted[1].length);
                list.push([titel[0].innerText, splitted[0], plz, stadt, tel[0].innerText, web[0].innerText]);
            } catch (error) {
                try {
                    let titel = attribut[x].getElementsByClassName('mod-Treffer__name'),
                        adresse = attribut[x].getElementsByClassName('mod-AdresseKompakt__adress-text'),
                        tel = attribut[x].getElementsByClassName('mod-TelefonnummerKompakt'),
                        web = attribut[x].getElementsByClassName('mod-TelefonnummerKompakt');
                    let splitted = adresse[0].innerText.split(",");
                    list.push([titel[0].innerText, splitted[0], splitted[1].innerText, "", tel[0].innerText, web[0].innerText]);
                } catch (error) {
                    try {
                        let titel = attribut[x].getElementsByClassName('mod-Treffer__name'),
                            adresse = attribut[x].getElementsByClassName('mod-AdresseKompakt__adress-text'),
                            tel = attribut[x].getElementsByClassName('mod-TelefonnummerKompakt'),
                            web = attribut[x].getElementsByClassName('mod-TelefonnummerKompakt');
                        list.push([titel[0].innerText, adresse[0].innerText, "", "", tel[0].innerText, web[0].innerText]);
                    } catch (error) {
                        list.push(["empty"]);
                    }
                }
            }

        }

        return list;
    });
    await save_in_excel(x);
}

async function save_in_excel(list) {
    //save in new excel file or else the data will be deleted
    let excel = require('excel4node');

    // Create a new instance of a Workbook class
    let workbook = new excel.Workbook();

    // Add Worksheets to the workbook
    let worksheet = workbook.addWorksheet('Sheet 1');
    //let worksheet2 = workbook.addWorksheet('Sheet 2');

    // Create a reusable style
    let style = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    for (let x = 0; x < list.length; x++) {
        for (let y = 0; y < list[x].length; y++) {
            // Set value of cell A2 to 'string' styled with paramaters of style
            worksheet.cell(x + 1, y + 1).string(list[x][y]).style(style);
        }
    }

    workbook.write('Gelbeseiten.xlsx');
}

async function klickWeiter(page) {
    let xs = 1, ys = 1;
    while ((xs != 0) && (ys != 0)) {
        await autoScroll(page);
        let { x, y } = await mouseClickID(page, "mod-LoadMore--button");
        ys = y;
        xs = x;
    }
}

async function mouseClickTag(page, tag1, i) {
    try {
        let { x, y } = await page.evaluate((tag1, i) => {
            let v = document.getElementsByTagName(tag1);
            let { top, left, bottom, right } = v[i].getBoundingClientRect();
            let x = Math.round((left + right) / 2);
            let y = Math.round((top + bottom) / 2);
            return { x, y };
        }, tag1, i);
        await page.mouse.click(x, y, { button: 'left' });
        return { x, y };
    } catch (error) {
        await console.log("Click with mouse didnt work on \"" + tag1 + "\"\nError " + error);
    }
}

async function mouseClickClass(page, class1, i) {
    try {
        let { x, y } = await page.evaluate((class1, i) => {
            let v = document.getElementsByClassName(class1);
            let { top, left, bottom, right } = v[i].getBoundingClientRect();
            let x = Math.round((left + right) / 2);
            let y = Math.round((top + bottom) / 2);
            return { x, y };
        }, class1, i);
        await page.mouse.click(x, y, { button: 'left' });
        return { x, y };
    } catch (error) {
        await console.log("Click with mouse didnt work on \"" + class1 + "\"\nError " + error);
    }
    //await console.log(x + " , " + y + " , " + i);
}

async function mouseClickID(page, id) {
    let { x, y } = await page.evaluate((id) => {
        let v = document.getElementById(id)
        let { top, left, bottom, right } = v.getBoundingClientRect();
        let x = Math.round((left + right) / 2);
        let y = Math.round((top + bottom) / 2);
        return { x, y };
    }, id);
    await page.mouse.click(x, y, { button: 'left' });
    await console.log(x + " , " + y);
    return { x, y }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 500;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight + 100) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function EndChrome(pid) {
    let shell = require('shelljs');
    await console.log("Chrome closed");
    await shell.exec('TASKKILL /PID ' + pid + ' /F');
}

async function EndAllChrome(pid) {
    let shell = require('shelljs');
    await shell.exec('TASKKILL /IM chrome.exe /F');
}

async function getURL(page) {
    let res = await page.evaluate(() => { return document.URL; });
    return res;
}

module.exports.getURL = getURL;
module.exports.autoScroll = autoScroll;
module.exports.EndChrome = EndChrome;
module.exports.gelbeSeitencookie = gelbeSeitencookie;
module.exports.buttonClick = buttonClick;
module.exports.gelbeSeiten_findElements = gelbeSeiten_findElements;
module.exports.klickWeiter = klickWeiter;
module.exports.deleteInput = deleteInput;
module.exports.gelbeSeiten_enter_adress = gelbeSeiten_enter_adress;
