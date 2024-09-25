
const Job = require("../models/Job");
const handleErrors = require("../utils/parseValidationErrs");
const { StatusCodes } = require("http-status-codes");

// Get all jobs 
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ createdBy: req.user._id }).sort("createdAt");
        res.render("jobs", { jobs, user: req.user });
    } catch (error) {
        res.status(500).render("error", { error });
    }
};

// Get a single job for editing
const getJob = async (req, res) => {
    const { id: jobId } = req.params;
    try {
        const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
        if (!job) {
            req.flash("error", "Job not found");
            return res.status(404).redirect("/jobs");
        }
        res.render("job", { job, user: req.user });
    } catch (error) {
        res.status(500).render("error", { error });
    }
};

// Create a new job
const createJob = async (req, res) => {
    try {
        req.body.createdBy = req.user._id;
        const job = await Job.create(req.body);

        // Redirect to the jobs list after creating the job
        req.flash("success", "Job created successfully");
        res.redirect("/jobs");
    } catch (error) {
        res.status(500).render("job", { job: null, user: req.user, error: "Error creating job" });
    }
};


const editJob = async (req, res) => {
    const { id: jobId } = req.params;
    const userId = req.user._id;

    console.log("Job ID:", jobId);
    console.log("User ID:", userId);

    try {
        const job = await Job.findOne({ _id: jobId, createdBy: userId });
        if (!job) {
            req.flash('error', 'Job not found or you do not have permission to edit this job.');
            return res.status(404).redirect('/jobs');
        }
        res.render('job', { job, user: req.user });
    } catch (error) {
        res.status(500).render("error", { error });
    }
};

const updateJob = async (req, res) => {
    try {
        const updatedJobs = await Job.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedJobs) {
            req.flash('error', 'Job not found');
            return res.status(404).redirect('/jobs');
        }
        res.redirect('/jobs');
    } catch (error) {
        handleErrors(error, req, res, '/jobs/edit/' + req.params.id);
    }
};

// Delete a job
const deleteJob = async (req, res) => {
    try {
        const deletedJob = await Job.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!deletedJob) {
            req.flash("error", "Job not found");
            return res.status(404).redirect("/jobs");
        }

        req.flash("success", "Job deleted successfully");
        res.redirect("/jobs");
    } catch (error) {
        res.status(500).render("error", { error });
    }
};

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    editJob,
    updateJob,
    deleteJob,
};
