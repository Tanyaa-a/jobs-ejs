const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");

let testUser = null;
let page = null;
let browser = null;

describe("jobs-ejs puppeteer test", function () {
  before(async function () {
   
    browser = await puppeteer.launch();
    page = await browser.newPage();

    await page.goto("http://localhost:3000");
  });

  after(async function () {
    this.timeout(5000);
  
    await browser.close();
  });

  describe("Go to site", function () {
    it("should have completed a connection", async function () {
      const { expect } = await import('chai')
      const element = await page.waitForSelector("body");
      expect(element).to.not.be.null;
    });
  });

  describe("Index page test", function () {
    it("finds the index page logon link", async () => {
      try {
        this.logonLink = await page.waitForSelector(
          'a[href="/sessions/logon"]' 
    )
      } catch (err) {
        console.error("Logon link not found:", err);
        throw err;
      }
    });

    it("gets to the logon page", async () => {
      try {
        await this.logonLink.click(); 
        await page.waitForNavigation(); 
        const email = await page.waitForSelector('input[name="email"]'); 
      } catch (err) {
        console.error("Error navigating to logon page:", err);
        throw err;
      }
    });
  });

  describe("Logon page test", function () {
    this.timeout(20000);

    it("resolves all the fields", async () => {
      try {
        this.email = await page.waitForSelector('input[name="email"]');
        this.password = await page.waitForSelector('input[name="password"]');
        this.submit = await page.waitForSelector("button ::-p-text(Logon)");
      } catch (err) {
        console.error("Logon form elements not found:", err);
        throw err;
      }
    });

    it("sends the logon", async () => {
      try {
        testUser = await seed_db(); 
        await this.email.type(testUser.email); 
        await this.password.type(testUserPassword); 
        await this.submit.click(); 
        await page.waitForNavigation(); 

        await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
        await page.waitForSelector('a[href="/secretWord"]');

        const copyr = await page.waitForSelector("p ::-p-text(copyright)");
        const copyrText = await copyr.evaluate((el) => el.textContent);
        console.log("Copyright text: ", copyrText);
      } catch (err) {
        console.error("Error during logon:", err);
        throw err;
      }
    });
  });
});
