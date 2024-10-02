const { expect, use } = require("chai");
const chaiHttp = require("chai-http");
const { app, server } = require("../app.js");
const { factory, seed_db } = require("../util/seed_db.js");
const { fakerEN_US } = require("@faker-js/faker");
const User = require("../models/User.js");
const faker = require('faker');


const chai = use(chaiHttp);
let request = chai.request;
chai.use(chaiHttp);

describe("tests for registration and logon", function () {
  after(() => {
    server.close();
  });
  it("should get the registration page", (done) => {
    chai
      .request(app)
      .get("/sessions/register")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");
        const textNoLineEnd = res.text.replaceAll("\n", "");
        const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        const cookies = res.headers["set-cookie"];
        const csrfCookie = cookies.find((element) =>
          element.startsWith("csrfToken"),
        );
        expect(csrfCookie).to.not.be.undefined;
        const cookieValue = /csrfToken=(.*?);\s/.exec(csrfCookie);
        this.csrfCookie = cookieValue[1];
        done();
      });
  });

  it("should register the user", async () => {
    this.password = faker.internet.password();
    this.user = await factory.build("user", { password: this.password });
    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request = chai
        .request(app)
        .post("/sessions/register")
        .set("Cookie", `csrfToken=${this.csrfCookie}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(dataToPost);
      res = await request;
      console.log("got here");
      expect(res).to.have.status(200);
      expect(res).to.have.property("text");
      expect(res.text).to.include("Students List");
      newUser = await User.findOne({ email: this.user.email });
      expect(newUser).to.not.be.null;
      console.log(newUser);
    } catch (err) {
      console.log(err);
      expect.fail("Register request failed");
    }
  });

  it("should log the user on", async () => {
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
  
    try {
      const response = await chai
        .request(app)
        .post("/sessions/logon")
        .set("Cookie", `csrfToken=${this.csrfCookie}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .redirects(0) 
        .send(dataToPost);
  
      expect(response).to.have.status(302); 
      expect(response.headers.location).to.equal('/');
  
      // Extract the session cookie for subsequent requests
      const cookies = response.headers["set-cookie"];
      this.sessionCookie = cookies.find((cookie) => cookie.startsWith("connect.sid"));
  
      expect(this.sessionCookie).to.not.be.undefined;
    } catch (err) {
      console.error(err);
      expect.fail("Logon request failed");
    }
  });
  it("should get the index page", (done) => {
    chai.request(app)
      .get("/")
      .set('Cookie', this.sessionCookie || '')
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include(this.user.name);
        done();
      });
  });
  
});