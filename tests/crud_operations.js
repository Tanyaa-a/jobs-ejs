const Job = require("../models/Job");
const { seed_db, testUserPassword } = require("../util/seed_db");
const { app } = require("../app");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../util/get_chai");
const { default: factory } = require("factory-bot");

describe("tests CRUD", function () {
  before(async () => {
    this.timeout(10000);
    const { expect, request } = await get_chai();
    this.test_user = await seed_db();
   
    let req = request.execute(app).get("/sessions/logon").send();
    let res = await req;
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1]; 
    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken"),
    );
    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };
    req = request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    res = await req;
    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid"),
    );
    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
  });
  it("should get the job list", async () => {
    const { expect, request } = await get_chai();
   const req = request
       .execute(app)
      .get("/jobs")
      .set("Cookie", this.sessionCookie)
      .send();
    const res = await req;

    expect(res).to.have.status(200);
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(22);
  });

  it("should post a new job", async () => {
        const { expect, request } = await get_chai();
        this.job = await factory.build("job", { createdBy: this.test_user._id });
        const dataToPost = {
          company: this.job.company,
          position: this.job.position,
          status: this.job.status,
          _csrf: this.csrfToken,
        };
        const req = request
          .execute(app)
          .post("/jobs")
          .set("Cookie", [this.csrfCookie, this.sessionCookie])
          .set("content-type", "application/x-www-form-urlencoded")
          .send(dataToPost);
    
        const res = await req;
    
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("List");
    
        const jobs = await Job.find({ createdBy: this.test_user._id });
        expect(jobs.length).to.equal(21);
      });
 })