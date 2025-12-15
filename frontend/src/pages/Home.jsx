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
    <div className="min-h-screen text-gray-100 relative overflow-hidden">
      {/* Background video (from public/homebg.mp4) */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/homebg.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{ filter: 'blur(1px)', transform: 'scale(1.02)' }}
      />

      {/* Dim overlay to improve contrast */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none"></div>

      <div className="relative z-10">
        <Navbar />

      {/* Header Section - Mobile Friendly */}
      <div className="bg-gradient-to-r from-blue-600/8 via-green-600/8 to-blue-600/8 border-b border-gray-800/50 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title and Description with Buttons on Right (Large Screens) */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-1 sm:mb-2">
                👋 Welcome, {userName}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage your coding projects and continue where you left off</p>
            </div>
            
            {/* Action Buttons - Right side on large screens */}
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 lg:justify-end">
              <button
                onClick={() => navigate('/editor')}
                className="px-4 py-2 btn-primary font-medium rounded-lg transition-all duration-200 text-sm active:scale-95 whitespace-nowrap"
                style={{transform: 'translateZ(0)', willChange: 'transform'}}
              >
                ✏️ Quick Code
              </button>
              <button
                onClick={() => setIsCreateModalShow(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium rounded-lg transition-all duration-200 text-sm active:scale-95 whitespace-nowrap"
                style={{transform: 'translateZ(0)', willChange: 'transform'}}
              >
                ➕ New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Stats Cards - Mobile Friendly Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {/* Total Projects */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4 backdrop-blur hover:border-gray-700 transition-all duration-200">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 font-medium">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">{projects.length}</p>
          </div>
          {/* Recent Projects */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4 backdrop-blur hover:border-gray-700 transition-all duration-200">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 font-medium">Active</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">{projects.length > 0 ? projects.length : 0}</p>
          </div>
          {/* Status */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4 backdrop-blur hover:border-gray-700 transition-all duration-200">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 font-medium">Status</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-400">✓</p>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">📁 Your Projects</h2>
            <span className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 text-gray-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {projects.length}
            </span>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="glass border border-green-500/20 rounded-lg p-4 sm:p-5 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 group flex flex-col min-h-[200px]"
                >
                  {/* Project Name and Description */}
                  <div
                    className="flex-1 cursor-pointer mb-4"
                    onClick={() => openProject(project._id)}
                  >
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-green-400 transition-colors duration-200 mb-2 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 min-h-[40px]">
                      {project.description || "No description provided"}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>📅 {new Date(project.created_at || project.date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openProject(project._id)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-sm font-medium rounded transition-all duration-200 active:scale-95"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded border border-red-500/30 transition-all duration-200 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 sm:p-12 text-center">
              <p className="text-4xl sm:text-5xl mb-3 sm:mb-4">📭</p>
              <p className="text-gray-400 text-base sm:text-lg font-medium">No projects yet</p>
              <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal - Mobile Optimized */}
      {isCreateModalShow && (
        <div
          onClick={(e) => {
            if (e.target.classList.contains("modal-backdrop")) {
              setIsCreateModalShow(false);
            }
          }}
          className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 transition-all duration-200"
        >
          <div className="glass border border-green-500/30 rounded-t-lg sm:rounded-lg p-5 sm:p-8 w-full sm:max-w-md shadow-2xl transform transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-4 sm:mb-6">
              ➕ New Project
            </h2>

            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 text-base"
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Project Description
                </label>
                <textarea
                  placeholder="What is your project about?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none text-base"
                />
              </div>
            </div>

            {/* Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setIsCreateModalShow(false);
                  setProjectName("");
                  setProjectDescription("");
                }}
                className="flex-1 px-3 py-2 border border-green-500/40 text-green-400 font-medium rounded-lg hover:bg-green-500/10 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Home;
