import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import { api_base_url } from '../helper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = () => {
  const [isCreateModalShow, setIsCreateModalShow] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userName, setUserName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch user data and projects
  const getUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Guard: don't call API if no token
    try {
      const res = await fetch(api_base_url + "/getUserData", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserName(data.user.name || "Developer");
      } else {
        toast.error(data.msg || "Failed to fetch user data");
      }
    } catch (err) {
    }
  };

  const getProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Guard: don't call API if no token
    try {
      const res = await fetch(api_base_url + "/getProjects", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token
        })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      } else {
        toast.error(data.msg || "Failed to fetch projects");
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    getUserData();
    getProjects();
  }, []);

  // prefer multiple possible name fields returned by backend
  const setUserNameFromData = (user) => {
    const name = (user && (user.name || user.username || user.email)) || "Developer";
    setUserName(name);
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!projectDescription.trim()) {
      toast.error("Project description is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(api_base_url + "/createProj", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          token: localStorage.getItem("token")
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Project created successfully!");
        setProjectName("");
        setProjectDescription("");
        setIsCreateModalShow(false);
        getProjects();
      } else {
        toast.error(data.msg || "Failed to create project");
      }
    } catch (err) {
      toast.error("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    fetch(api_base_url + "/deleteProject", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId: id,
        token: localStorage.getItem("token")
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        toast.success("Project deleted successfully");
        getProjects();
      } else {
        toast.error(data.msg || "Failed to delete project");
      }
    });
  };

  const openProject = (projectId) => {
    navigate("/editior/" + projectId);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Navbar />

      {/* Background Grid (same as Login) */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(90deg, #ec4899 1px, transparent 1px), linear-gradient(#ec4899 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600/5 via-green-600/5 to-blue-600/5 border-b border-gray-800/50 px-8 py-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-2">
              👋 Welcome, {userName}
            </h1>
            <p className="text-gray-400">Manage your coding projects and continue where you left off</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/editor')}
              className="px-5 py-3 btn-primary font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✏️ Quick Code
            </button>
            <button
              onClick={() => setIsCreateModalShow(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Projects list (spans 2 columns on md+) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Your Projects</h2>
              <span className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 text-gray-300 px-3 py-1 rounded-full text-sm">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {projects && projects.length > 0 ? (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="glass border border-green-500/20 rounded-lg p-6 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => openProject(project._id)}
                      >
                        <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors duration-200 mb-2">
                          {project.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {project.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📅 {new Date(project.created_at || project.date).toLocaleDateString()}</span>
                          <span>🕐 {new Date(project.created_at || project.date).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => openProject(project._id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-sm font-medium rounded transition-all duration-200 shadow-md hover:shadow-green-500/25"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => deleteProject(project._id)}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded border border-red-500/30 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-gray-400 text-lg">No projects yet</p>
                <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
              </div>
            )}
          </div>

          {/* Right: Stats Cards */}
          <div className="md:col-span-1 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="glass border border-green-500/20 rounded-lg p-6 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold text-white mt-2">{projects.length}</p>
                  </div>
                  <div className="text-4xl">📁</div>
                </div>
              </div>

              {/* Quick Code moved to header */}
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreateModalShow && (
        <div
          onClick={(e) => {
            if (e.target.classList.contains("modal-backdrop")) {
              setIsCreateModalShow(false);
            }
          }}
          className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-200"
        >
          <div className="glass border border-green-500/30 rounded-lg p-8 w-full max-w-md shadow-2xl transform transition-all duration-200">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-6">Create New Project</h2>

            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Project Description
                </label>
                <textarea
                  placeholder="What is your project about?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsCreateModalShow(false);
                  setProjectName("");
                  setProjectDescription("");
                }}
                className="flex-1 px-4 py-2 border border-green-500/40 text-green-400 font-medium rounded-lg hover:bg-green-500/10 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
