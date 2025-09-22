/*
const puppeteer = require('puppeteer')
const { faker } = require('@faker-js/faker')
const timeout = 5000

const { querySelectorsRules, queryManualFill, reportFormFieldSelectors } = require('./utils')

let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null
    });
    page = await browser.newPage();
});

describe('Рендер страницы входа и авторизации', () => {
    test('Принять куки для начала работы', async () => {
        await page.goto(URL, {waitUntil: 'domcontentloaded'});
        await page.click('#acceptCookies')
    })

    test('Наличие кнопки "Зарегистрироваться" и корректной навигации с неё', async () => {
        await page.goto(URL, {waitUntil: 'domcontentloaded'});
        await page.waitForSelector('#registerBtn');
        await Promise.all([
            page.click('#registerBtn'),
            page.waitForNavigation({waitUntil: 'domcontentloaded'})
        ])

        const url = await page.evaluate('location.href');
        expect(url).toContain('/auth/registration')
    }, timeout);
});

describe('Создание и верификация аккаунта', () => {
    test('Заполнение формы некорректными данными', async () => {
        await page.waitForSelector('.submitBtn')
        await page.type('#name', faker.person.fullName())
        await page.type('#email', faker.internet.email())
        await page.type('#pwd1', faker.internet.password({length: 11}))
        await page.type('#pwd2', faker.internet.password({length: 11}))
        await page.click('#policyCheck')
        await page.click('.submitBtn')
        await page.waitForTimeout(1000)
        await page.waitForSelector('.p-toast-message-error')
    }, timeout);

    let mail;
    let password;
    let verifyUrl;

    test('Заполнение формы корректными данными', async () => {
        await page.goto(URL, {waitUntil: 'domcontentloaded'});
        await page.waitForSelector('#registerBtn');
        await Promise.all([
            page.click('#registerBtn'),
            page.waitForNavigation({waitUntil: 'domcontentloaded'})
        ])
        await page.waitForSelector('.submitBtn')
        await page.type('#name', faker.person.fullName())
        password = faker.internet.password({length: 11})
        mail = faker.internet.email()
        await page.type('#email', mail)
        await page.type('#pwd1', password)
        await page.type('#pwd2', password)
        await page.click('#policyCheck')
        await page.click('.submitBtn')

        const resp = await page.waitForResponse(async r => {
            if(r.url().includes('/user/create') && r.request().method() === "POST") {
                const json = await r.json()
                verifyUrl = json.verify
                return true
            }
        })

        expect(verifyUrl).not.toBeNull()
    }, timeout);

    test('Верификация аккаунта и вход с предзаполненным email', async () => {
        await page.goto(`${URL}${verifyUrl}`, {waitUntil: 'domcontentloaded'});
        await page.waitForTimeout(1000)
        await page.waitForSelector('#signinBtn')
        await page.type('#pwd', password)
        await page.click('#signinBtn')
        await page.waitForTimeout(3000)
    }, timeout*2)
})

describe('Заполнение формы заявки на фестиваль', () => {
    test('Наличие кнопки "Подать заявку"', async () => {
        await Promise.all([
            page.waitForSelector('#createApplication'),
            page.click('#createApplication'),
            page.waitForSelector('#inn')
        ])
    }, timeout)

    test('Наличие формы заявки и её заполнение', async () => {
        await page.type('#inn', '3904040429')
        await page.waitForTimeout(3000)
        await page.waitForSelector('.p-listbox-item')
        await page.click('.p-listbox-item')
        await page.waitForTimeout(1000)
        for(let i of querySelectorsRules) {
            const val = await page.$eval(i.selector, (e, i) => e[i.key || 'value'], i)
            expect(val).toBeDefined()
            expect(val).not.toBeNull()
        }

        for(let i of queryManualFill) {
            await page.type(i.selector, i.value)
        }

        await page.$$eval('.activate-nomination', els => els.forEach(el => el.click()))

        const ids = ['nomins00woman', 'nomins01woman', 'nomins02woman', 'nomins10woman','nomins00man', 'nomins01man', 'nomins02man', 'nomins10man']
        for(let id of ids) {
            try {
                await page.type(`#${id}`, faker.number.int({max: 200}).toString())
            } catch(e) {
                //console.log(`No input matching id`, id)
            }
        }

        await page.waitForTimeout(3000)
        await page.click('#nextStep')
    }, timeout*4)

    test('Переход на второй шаг подачи заявки. Ожидание и скачивание печатной формы', async () => {
        await page.waitForSelector('.react-pdf__Page__canvas')

        await page.waitForSelector('#downloadForm')
        await page.click('#downloadForm')
        await page.waitForSelector('#postDownloadBtn')
        await page.click('#postDownloadBtn')
    }, 5000)

    test('Переход на третий шаг. Загрузка скана формы', async () => {
        await page.waitForSelector('.p-fileupload-choose')
        const input = await page.$('input[type="file"]')
        await input.uploadFile(`${__dirname}/jest_sample_form.pdf`)
        await page.waitForSelector('#sendForm')
        await page.click('#sendForm')
        await page.waitForTimeout(1000)
    }, 4000)
})

describe('Заполнение отчетов о мероприятиях', () => {
    let cards

    test('Загрузка списка мероприятий', async () => {
        await page.reload()
        await page.waitForTimeout(1000)
        await page.click('.links .link')
        await page.waitForTimeout(1000)
        cards = await page.$$('.p-accordion-header')
        expect(cards.length).toBeGreaterThan(0)
    }, 3000)

    test('Раскрытие форм отчетов мероприятий', async () => {
        for(let card of cards.slice(5, 9)) {
            await card.click()
            await page.waitForSelector('.report-form')
            await page.waitForTimeout(1000)
            await page.click('#date-start .p-datepicker-trigger')
            await page.waitForSelector('.p-datepicker-next')
            await page.click('.p-datepicker-next')
            await page.waitForSelector('.p-datepicker-calendar span[data-p-disabled="false"]')
            await page.click('.p-datepicker-calendar span[data-p-disabled="false"]')
            await page.waitForTimeout(500)
            for(let sel of reportFormFieldSelectors) {
                try {
                    const nodes = await page.$$(sel.selector)
                    let i = 0
                    for(let node of nodes) {
                        if(sel.type) {
                            const typeVal = sel.random ? faker.number.int({max: sel.randomMax}).toString() : sel.value+(i || '')
                            await node.type(typeVal)
                        } else if(sel.upload) {
                            await node.uploadFile(`${__dirname}/jest_sample_photo.jpg`)
                        } else {
                            node.value = sel.value
                        }

                        i++
                    }
                } catch(e) {
                    console.log('Miss')
                }

                await page.waitForTimeout(1000)
            }

            await page.waitForSelector('.report-form .report-form-btn')
            await page.click('.report-form .report-form-btn')
            await page.waitForSelector('.p-confirm-dialog-accept')
            await page.click('.p-confirm-dialog-accept')
            await page.waitForTimeout(1500)
        }
    }, 60000)

    test('Пользовательский триггер на завершение участия', async () => {
        await page.reload()
        await page.waitForTimeout(2000)
        await page.waitForSelector('.reports-next-stage-btn')
        await page.click('.reports-next-stage-btn')
        await page.waitForSelector('.p-confirm-dialog-accept')
        await page.click('.p-confirm-dialog-accept')
    }, 3000)

    test('Скачивание печатной формы по отчетам', async () => {
        await page.waitForSelector('.react-pdf__Page__canvas')
        await page.waitForSelector('.actions .download_button')
        await page.click('.actions .download_button')
        await page.waitForSelector('#next_step_btn')
        await page.click('#next_step_btn')
        await page.waitForTimeout(1000)
    }, 6000)

    test('Переход на финальный шаг. Загрузка скана и завершение', async () => {
        await page.waitForSelector('.p-fileupload-choose')
        const input = await page.$('input[type="file"]')
        await input.uploadFile(`${__dirname}/jest_sample_report.pdf`)
        await page.waitForTimeout(1000)
        await page.waitForSelector('.p-button.submit')
        await page.click('.p-button.submit')
        await page.waitForSelector('.p-confirm-dialog-accept')
        await page.click('.p-confirm-dialog-accept')
        await page.waitForSelector('.pi-check-circle')
        await page.waitForTimeout(1000)
    }, 6000)
})

afterAll(() => browser.close());
*/
