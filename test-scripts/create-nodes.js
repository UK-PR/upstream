import puppeteer from 'puppeteer';
import test from 'ava';
import node_urls from '/test/data/add-node-urls.json';
import opts from '/test/config/opts.json'
import randomWords from 'random-words';

let browser, page;

test.before(async t => {
  browser = await puppeteer.launch(opts);
  page = await browser.newPage();

  await page.goto('http://localhost/user');
  await page.type('[name="name"]', 'admin');
  await page.type('[name="pass"]', 'admin');
  await page.click('#edit-submit');

  await page.$('body.user-logged-in');
});

test.after(t => {
  browser.close();
});

node_urls.forEach(url => {
  test.serial('create ' + url, async t => {
    await page.goto(url);

    const titleEl = await page.evaluate(() => document.querySelector('[name="title[0][value]"]'));
    if (titleEl !== null) {
      await page.type('[name="title[0][value]"]', randomWords({ min: 2, max: 6, join: ' ' }));
    }
    
    const required = await page.evaluate(() => document.querySelectorAll('input.required'));
    if (required.length) {
      required.forEach(element => {
        if (!element.value) {
          await element.type(randomWords({ min: 2, max: 6, join: ' ' }));
        }
      });
    }

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('#edit-submit')
    ]);

    const message = await page.evaluate(() => document.querySelector('div.success').innerText);
    t.true(message.includes('has been created.'));
  });
})

