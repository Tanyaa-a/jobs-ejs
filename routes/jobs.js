const express = require("express");
const router = express.Router();
const Job = require('../models/Job');

const {
  getAllJobs,
  createJob,
    editJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobs");

router.get ("/", getAllJobs);
router.post ("/", createJob);
router.get('/new', (req, res) => {
    res.render('job', { job: null, user: req.user });
  });
router.get ("/edit/:id", editJob);
router.post ("/update/:id", updateJob);
router.post ("/delete/:id", deleteJob);
module.exports = router;
