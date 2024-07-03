
async function deleteInput(page, inp) {
    await page.evaluate((inp) => {
        document.querySelector(inp).value = '';
    }, inp);
}

async function gelbeSeitencookie(page) {
    //laden
    //await page.setViewport({ width: 1620, height: 1080 });
    //click1
    await mouseClickID(page, "cmpbntsavetxt");
    // await page.waitForTimeout(3000);
    // await page.mouse.click(915, 725);
    // await page.waitForTimeout(1000);
    // await page.mouse.click(655, 645);
    // await page.waitForTimeout(1000);
    //await page.screenshot({ path:' x_newSite.png' });
}

async function type_slow(page, input, text) {
    let letters = text.split("");
    for (let l = 0; l < letters.length; l++) {
        await page.type(input, letters[l]);
        await page.waitForTimeout(1000);
    }
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

async function lieferando_enter_adress(page, was, wo) {
    try {
        await page.waitForSelector('input[id="combobox-input_0"]', { visible: true, timeout: 10000 });
    } catch (error) {
        await console.log("warten abgebrochen");
    }
    try {
        await page.waitForTimeout(1000);
        await mouseClickTag(page, "label", 0);
        await page.waitForTimeout(1000);
        await deleteInput(page, 'input[id="combobox-input_0"]');
        await page.waitForTimeout(1000);
        await type_slow(page, 'input[id="combobox-input_0"]', was);
        await console.log(was + ". wurden eingefuegt");
    } catch (e) {
        await console.log("warten abgebrochen: ", e);
    }
    try {
        await page.waitForSelector('div[class="_2GljJ _2PIGg"]', { visible: true, timeout: 30000 });
        // await page.click('div[class="_2GljJ _2PIGg"]')[0];
        await page.waitForTimeout(3000);
        await mouseClickClass(page, "_2GljJ _2PIGg", 0);
        await console.log(was + ". wurden angeklickt");

    } catch (error) {
        await console.log("Diese Postleitzahl ist nicht in Lieferando hinterlegt");
        await page.waitForTimeout(3000);
    }
}

async function buttonClick(page, txt) {
    let s = await page.evaluate(() => {
        let get1 = document.getElementsByClassName('button');
        for (let element = 0; element < get1.length; element++) {
            if (get1[element].innerHTML == txt) {
                //set1 = get1[element].innerHTML;
                get1[element].click();
                return element;
            }
        }
    });
    //let {x,y} = await mouseClickClass(page, 'button', s);
    //await console.log("2. x: "+ x + "y: "+ y);
    //return {x,y};
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


async function lieferando_findElements(page) {
    try {
        let x = await page.evaluate(() => {
            let attribut = document.getElementsByClassName('tpNNO fBvBJ _1DS7j'), list = [];
            for (let x = 0; x < attribut.length; x++) {
                list.push(attribut[x].innerText);
            }
            return list;
        });
        await console.log(x);
    } catch (error) {
        await console.log(error);
    }
    // await save_in_excel(x);
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
        //await page.click('a[id="mod-LoadMore--button"]');
        await autoScroll(page);
        //await page.waitForTimeout(100);
        let { x, y } = await mouseClickID(page, "mod-LoadMore--button");
        ys = y;
        xs = x;
        /*await page.mouse.move((Math.floor(Math.random() * 10)*1000), (Math.floor(Math.random() * 10)*1000), { steps: 100 });
        await page.waitForTimeout((Math.floor(Math.random() * 10)*100));

        await page.mouse.move(x-5, y, { steps: 10 });
        await page.waitForTimeout((Math.floor(Math.random() * 10)*10));

        //await page.waitForTimeout(500);
        //await page.mouse.click(615, 540);
        await page.mouse.click(x, y);
        await page.mouse.move(x+5, y, { steps: 5 });*/

    }
}

async function mouseClickTag(page, tag1, i) {
    try {
        let { x, y } = await page.evaluate((tag1, i) => {
            let v = document.getElementsByTagName(tag1);
            let { top, left, bottom, right } = v[i].getBoundingClientRect();
            let x = Math.round((left + right) / 2);
            let y = Math.round((top + bottom) / 2);
            //alert(x + " , " + y + " : " + top + " , " + left + " , " + bottom + " , " + right);
            return { x, y };
        }, tag1, i);
        await page.mouse.click(x, y, { button: 'left' });
        //await console.log("1. x: "+ x + "y: "+ y);
        return { x, y };
    } catch (error) {
        await console.log("Click with mouse didnt work on \"" + tag1 + "\"\nError " + error);
    }
    //await console.log(x + " , " + y + " , " + i);
}

async function mouseClickClass(page, class1, i) {
    try {
        let { x, y } = await page.evaluate((class1, i) => {
            let v = document.getElementsByClassName(class1);
            let { top, left, bottom, right } = v[i].getBoundingClientRect();
            let x = Math.round((left + right) / 2);
            let y = Math.round((top + bottom) / 2);
            //alert(x + " , " + y + " : " + top + " , " + left + " , " + bottom + " , " + right);
            return { x, y };
        }, class1, i);
        await page.mouse.click(x, y, { button: 'left' });
        //await console.log("1. x: "+ x + "y: "+ y);
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
        //alert(x + " , " + y + " : " + top + " , " + left + " , " + bottom + " , " + right);
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
    //await shell.exec('TASKKILL /?');
}

async function EndAllChrome(pid) {
    let shell = require('shelljs');
    await shell.exec('TASKKILL /IM chrome.exe /F');
    //await shell.exec('TASKKILL /?');
}

async function getURL(page) {
    let res = await page.evaluate(() => { return document.URL; });
    return res;
}

module.exports.getURL = getURL;
module.exports.autoScroll = autoScroll;
module.exports.EndChrome = EndChrome;
module.exports.mouseClickTag = mouseClickTag;
module.exports.mouseClickClass = mouseClickClass;
module.exports.mouseClickID = mouseClickID;
module.exports.gelbeSeitencookie = gelbeSeitencookie;
module.exports.buttonClick = buttonClick;
module.exports.gelbeSeiten_findElements = gelbeSeiten_findElements;
module.exports.lieferando_findElements = lieferando_findElements;
module.exports.klickWeiter = klickWeiter;
module.exports.deleteInput = deleteInput;
module.exports.gelbeSeiten_enter_adress = gelbeSeiten_enter_adress;
module.exports.lieferando_enter_adress = lieferando_enter_adress;