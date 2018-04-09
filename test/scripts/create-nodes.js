import puppeteer from 'puppeteer';
import test from 'ava';
import node_urls from '../data/add-node-urls.json';
import opts from '../config/opts.json'
import randomWords from 'random-words';

let browser, page;

test.before(async t => {
  browser = await puppeteer.launch(opts);
  page = await browser.newPage();

  await page.goto(site.homepage + '/user');
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

    if (await page.$('[name="title[0][value]"]') !== null) {
      await page.type('[name="title[0][value]"]', 'Test Node');
    }
    
    const required = await page.$$('input.required');
    required.forEach(element => {
      element.type(randomWords({ min: 2, max: 6, join: ' ' }))
    })

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('#edit-submit')
    ]);

    const message = await page.$('div.success').text();

    t.true(message.includes('has been created.'));
  });
})
