const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
const runJobModel = require("../models/runJobModel");
const runSnapshotModel = require("../models/runSnapshotModel");
const shareModel = require("../models/shareModel");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || "secret";

function getStartupCode(language) {
  if (!language) return 'console.log("Hello World")';
  const lang = language.toLowerCase();
  if (lang === "python" || lang === 'python3') {
    return 'print("Hello World")';
  } else if (lang === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  } else if (lang === "javascript") {
    return 'console.log("Hello World");';
  } else if (lang === 'typescript') {
    return 'const greet = (): void => { console.log("Hello TypeScript"); }\\ngreet();';
  } else if (lang === "cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  } else if (language.toLowerCase() === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  } else if (language.toLowerCase() === "go") {
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}';
  } else if (language.toLowerCase() === "bash") {
    return 'echo "Hello World"';
  } else if (lang === 'html') {
    return '<!doctype html>\\n<html>\\n  <head><meta charset="utf-8"><title>Preview</title></head>\\n  <body>\\n    <h1>Hello World</h1>\\n    <p>This is an HTML starter file.</p>\\n  </body>\\n</html>';
  } else if (lang === 'css') {
    return 'body { font-family: Arial, sans-serif; }\\nh1 { color: #2b6cb0; }';
  } else if (lang === 'text' || lang === 'txt' || lang === 'env' || lang === 'json' || lang === 'md') {
    return 'Hello World';
  } else {
    return 'Language not supported';
  }
}
exports.signUp = async (req, res) => {
  try {
    let { email, pwd, fullName } = req.body;

    // Validation
    if (!email || !pwd || !fullName) {
      return res.status(400).json({
        success: false,
        msg: "Email, password, and full name are required"
      });
    }

    let emailCheck = await userModel.findOne({ email: email });
    if (emailCheck) {
      return res.status(400).json({
        success: false,
        msg: "Email already registered"
      });
    }

    bcrypt.genSalt(12, function (err, salt) {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: "Error hashing password"
        });
      }

      bcrypt.hash(pwd, salt, async function (err, hash) {
        if (err) {
          return res.status(500).json({
            success: false,
            msg: "Error hashing password"
          });
        }

        try {
          let user = await userModel.create({
            email: email,
            password: hash,
            name: fullName,
            created_at: new Date()
          });

          return res.status(200).json({
            success: true,
            msg: "User created successfully",
            userId: user._id
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            msg: error.message
          });
        }
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, pwd } = req.body;

    // Validation
    if (!email || !pwd) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    bcrypt.compare(pwd, user.password, async function (err, result) {
      if (result) {
        let token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

        return res.status(200).json({
          success: true,
          msg: "User logged in successfully",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
      }
      else {
        return res.status(401).json({
          success: false,
          msg: "Invalid password"
        });
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.createProj = async (req, res) => {
  try {
    let { name, description, token, language } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        msg: "Project name is required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Default language to javascript if not provided
    const projectLanguage = language || 'javascript';
    
    let project = await projectModel.create({
      owner_id: user._id,
      name: name,
      description: description || '',
      language: projectLanguage,
      code: getStartupCode(projectLanguage),
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      msg: "Project created successfully",
      projectId: project._id,
      project: project
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.saveProject = async (req, res) => {
  try {
    let { token, projectId, code, files, fileTree } = req.body;

    // Validation
    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and projectId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Check if project exists and user is the owner
    let existingProject = await projectModel.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

    if (existingProject.owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized - you are not the owner of this project"
      });
    }

    // Update with either fileTree or files array or just code
    const updateData = {};
    if (fileTree && Array.isArray(fileTree)) {
      updateData.fileTree = fileTree;
    }
    if (files && Array.isArray(files)) {
      updateData.files = files;
    }
    if (code !== undefined) {
      updateData.code = code;
    }

    let project = await projectModel.findOneAndUpdate(
      { _id: projectId },
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully",
      project: project
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        msg: "Invalid or expired token"
      });
    }
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.getProjects = async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Token is required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Fetch all projects for this user, sorted by updated_at
    let projects = await projectModel.find({ owner_id: user._id })
      .sort({ updated_at: -1 })
      .select('_id name description language created_at updated_at');

    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects: projects,
      total: projects.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.getProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;

    // Validation
    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and projectId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOne({ _id: projectId });

    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

    // Verify ownership
    if (project.owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized - you are not the owner of this project"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Project fetched successfully",
      project: project
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        msg: "Invalid or expired token"
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        msg: "Invalid project ID format"
      });
    }
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.deleteProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;

    // Validation
    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and projectId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Check if project exists first
    let project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

    // Verify ownership
    if (project.owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized - you are not the owner of this project"
      });
    }

    // Delete the project
    await projectModel.findOneAndDelete({ _id: projectId });

    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully"
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        msg: "Invalid or expired token"
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        msg: "Invalid project ID format"
      });
    }
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.editProject = async (req, res) => {
  try {

    let {token, projectId, name} = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOne({ _id: projectId });
    if(project){
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project edited successfully"
      })
    }
    else{
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

// Get user data
exports.getUserData = async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Token is required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId }).select('_id name email created_at');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "User data fetched successfully",
      user: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Create a new run job
exports.createRunJob = async (req, res) => {
  try {
    let { token, projectId, entryPoint } = req.body;

    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and projectId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

    let runJob = await runJobModel.create({
      project_id: projectId,
      user_id: user._id,
      entry_point: entryPoint || 'main',
      status: 'queued',
      queued_at: new Date()
    });

    return res.status(200).json({
      success: true,
      msg: "Run job created successfully",
      jobId: runJob._id,
      job: runJob
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Update run job with execution results
exports.updateRunJob = async (req, res) => {
  try {
    let { token, jobId, status, output, error } = req.body;

    if (!token || !jobId) {
      return res.status(400).json({
        success: false,
        msg: "Token and jobId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let runJob = await runJobModel.findById(jobId);
    if (!runJob) {
      return res.status(404).json({
        success: false,
        msg: "Run job not found"
      });
    }

    // Check if user owns this job
    if (runJob.user_id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized"
      });
    }

    let updateData = {
      status: status || 'success',
      finished_at: new Date()
    };

    if (status === 'running') {
      updateData.started_at = new Date();
    }

    if (output !== undefined) {
      updateData.output = output;
    }

    if (error !== undefined) {
      updateData.error = error;
    }

    let updatedJob = await runJobModel.findByIdAndUpdate(jobId, updateData, { new: true });

    return res.status(200).json({
      success: true,
      msg: "Run job updated successfully",
      job: updatedJob
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Get run history for a project
exports.getRunHistory = async (req, res) => {
  try {
    let { token, projectId, limit } = req.body;

    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and projectId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

    // Check if user owns this project
    if (project.owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized"
      });
    }

    let runJobs = await runJobModel
      .find({ project_id: projectId })
      .sort({ queued_at: -1 })
      .limit(limit || 20)
      .lean();

    return res.status(200).json({
      success: true,
      msg: "Run history fetched successfully",
      jobs: runJobs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Delete run history for a specific file (by entryPoint) in a project
exports.deleteRunHistory = async (req, res) => {
  try {
    let { token, projectId, entryPoint } = req.body;

    if (!token || !projectId || !entryPoint) {
      return res.status(400).json({
        success: false,
        msg: "Token, projectId, and entryPoint are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

    // Check if user owns this project
    if (project.owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized - you do not own this project"
      });
    }

    // Delete all run jobs for this file (entryPoint) in this project
    const result = await runJobModel.deleteMany({
      project_id: projectId,
      entry_point: entryPoint
    });

    return res.status(200).json({
      success: true,
      msg: "Run history deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error in deleteRunHistory:', error);
    return res.status(500).json({
      success: false,
      msg: `Error deleting history: ${error.message}`
    });
  }
};

// Create a run snapshot (save output)
exports.createRunSnapshot = async (req, res) => {
  try {
    let { token, jobId, projectId, outputUrl, artifactUrl } = req.body;

    if (!token || !jobId || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token, jobId, and projectId are required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let snapshot = await runSnapshotModel.create({
      job_id: jobId,
      project_id: projectId,
      output_url: outputUrl || '',
      artifact_url: artifactUrl || '',
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      msg: "Run snapshot created successfully",
      snapshotId: snapshot._id,
      snapshot: snapshot
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// ===== SHARING FUNCTIONS =====

// Generate unique share ID
function generateShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Create Share
exports.createShare = async (req, res) => {
  try {
    const { code, language, fileName, token } = req.body;

    if (!code || !language || !fileName) {
      return res.status(400).json({
        success: false,
        msg: "Code, language, and file name are required"
      });
    }

    // Verify token to get user
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
      } catch (err) {
        // Continue without user (anonymous share)
      }
    }

    // Create share object
    const shareId = generateShareId();
    const shareData = {
      shareId: shareId,
      code: code,
      language: language,
      fileName: fileName,
      sharedBy: userId || null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      viewCount: 0
    };

    // Store in database
    const share = new shareModel(shareData);
    await share.save();

    return res.status(201).json({
      success: true,
      msg: "Share created successfully",
      shareId: shareId
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Get Share
exports.getShare = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        msg: "Share ID is required"
      });
    }

    const share = await shareModel.findOne({ shareId: shareId });

    if (!share) {
      return res.status(404).json({
        success: false,
        msg: "Share not found"
      });
    }

    // Check if expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      await shareModel.deleteOne({ _id: share._id });
      return res.status(404).json({
        success: false,
        msg: "Share has expired"
      });
    }

    // Increment view count
    share.viewCount = (share.viewCount || 0) + 1;
    await share.save();

    return res.status(200).json({
      success: true,
      share: {
        code: share.code,
        language: share.language,
        fileName: share.fileName,
        createdAt: share.createdAt,
        viewCount: share.viewCount
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Delete Share
exports.deleteShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { token } = req.body;

    if (!shareId || !token) {
      return res.status(400).json({
        success: false,
        msg: "Share ID and token are required"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    const share = await shareModel.findOne({ shareId: shareId });

    if (!share) {
      return res.status(404).json({
        success: false,
        msg: "Share not found"
      });
    }

    // Check if user owns this share
    if (share.sharedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to delete this share"
      });
    }

    await shareModel.deleteOne({ _id: share._id });

    return res.status(200).json({
      success: true,
      msg: "Share deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

// Get My Shares
exports.getMyShares = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Token is required"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    const shares = await shareModel.find({ sharedBy: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      shares: shares
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};