import puppeteer from 'puppeteer';
import test from 'ava';
import fs from 'fs';
import opts from '../config/opts.json'

let browser, page;

test.before(async t => {
  browser = await puppeteer.launch(opts);
  page = await browser.newPage();
});

test.after(t => {
  browser.close();
});

test.serial('homepage loads', async t => {
    let response = await page.goto('http://localhost/');
    t.true(response.ok());
});

test.serial('login', async t => {
    await page.goto('http://localhost/user');

    await page.type('[name="name"]', 'admin');
    await page.type('[name="pass"]', 'admin');
    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('#edit-submit')
    ]);

    const body = await page.$('body.user-logged-in');
    t.truthy(body);
});

test.serial('list content types', async t => {
    await page.goto('http://localhost/node/add');

    const add_node_urls = await page.evaluate(() => {
      const anchors = document.querySelectorAll('.admin-list a');
      return [].map.call(anchors, a => a.href);
    });

    t.true(add_node_urls.length > 0);

    fs.writeFileSync('../data/add-node-urls.json', JSON.stringify(add_node_urls));
});