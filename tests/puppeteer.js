// tests/puppeteer.js

const puppeteer = require("puppeteer");
const { server } = require("../app"); // Assuming your server is exported as 'server' from '../app'
const { seed_db, testUserPassword } = require("../util/seed_db");

let browser;
let page;
let testUser;

describe("index page test", function () {
    before(async function () {
      this.timeout(10000);
      browser = await puppeteer.launch();
      page = await browser.newPage();
      await page.goto("http://localhost:3000");
    });
    after(async function () {
      this.timeout(5000);
      await browser.close();
      server.close();
      return;
    });

describe("got to site", function () {
    it("should have completed a connection", function (done) {
      done();
    });
  });

describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async () => {
      this.logonLink = await page.waitForSelector(
        "a ::-p-text(Click this link to logon)",
      );
    });
    it("gets to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector("input[name=email]");
    });
  });

  describe("logon page test", function () {
    console.log("at line 48", this.outerd, this.innerd, this.secondIt)
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector("input[name=email]");
      this.password = await page.waitForSelector("input[name=password]");
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });
    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(
        `p ::-p-text(${testUser.name} is logged on.)`,
      );
      await page.waitForSelector("a ::-p-text(change the secret");
      await page.waitForSelector('a[href="/secretWord"]');
      const copyr = await page.waitForSelector("p ::-p-text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });
})