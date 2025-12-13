var express = require('express');
const { signUp, login, createProj, saveProject, getProjects, getProject, deleteProject, editProject, getUserData, createRunJob, updateRunJob, getRunHistory, createRunSnapshot } = require('../controllers/userController');
var router = express.Router();

// Health check endpoint
router.get('/', function(req, res) {
  res.json({ success: true, msg: 'CodeX IDE API is running' });
});

// Authentication routes
router.post("/signUp", signUp);
router.post("/login", login);

// User routes
router.post("/getUserData", getUserData);

// Project routes
router.post("/createProj", createProj);
router.post("/saveProject", saveProject);
router.post("/getProjects", getProjects);
router.post("/getProject", getProject);
router.post("/deleteProject", deleteProject);
router.post("/editProject", editProject);

// Run Job routes
router.post("/createRunJob", createRunJob);
router.post("/updateRunJob", updateRunJob);
router.post("/getRunHistory", getRunHistory);
router.post("/createRunSnapshot", createRunSnapshot);

module.exports = router;
