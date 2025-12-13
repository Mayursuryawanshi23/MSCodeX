import React, { useEffect, useState, useRef } from 'react';
import Editor2 from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';

// Detect language from file extension
const getLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'py': 'python3',
    'js': 'javascript',
    'ts': 'typescript',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'java': 'java',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'txt': 'text', 'md': 'text', 'json': 'text', 'yml': 'text', 'yaml': 'text', 'env': 'text',
    'dotenv': 'text', 'pdf': 'pdf'
  };
  return languageMap[ext] || null;
};

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [projectData, setProjectData] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createContext, setCreateContext] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [resizing, setResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  // Output panel resizing and collapse - NOW AT BOTTOM
  const [outputHeight, setOutputHeight] = useState(250); // px
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const [outputResizing, setOutputResizing] = useState(false);
  const outputRef = useRef(null);
  const editorAreaRef = useRef(null);
  
  // HTML preview state - for right side panel
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [htmlPreviewCode, setHtmlPreviewCode] = useState('');
  const [isHtmlRunning, setIsHtmlRunning] = useState(false);

  // Run history state
  const [runHistory, setRunHistory] = useState([]);
  const [showRunHistory, setShowRunHistory] = useState(false);

  // Fetch project data or initialize scratch editor
  useEffect(() => {
    const fetchProject = async () => {
      try {
        // If no project ID, initialize scratch editor
        if (!id) {
          const defaultFile = {
            id: generateId(),
            name: 'main.js',
            type: 'file',
            content: '// Start coding here!\n// This is a temporary scratch file\n',
            language: 'javascript',
            children: []
          };
          setProjectData({ name: 'Quick Code', language: 'javascript' });
          setFileTree([defaultFile]);
          setCurrentFile(defaultFile);
          setCode(defaultFile.content);
          setLoading(false);
          return;
        }

        const res = await fetch(`${api_base_url}/getProject`, {
          mode: 'cors',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: localStorage.getItem('token'),
            projectId: id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProjectData(data.project);
          
          if (data.project.fileTree && data.project.fileTree.length > 0) {
            setFileTree(data.project.fileTree);
            const firstFile = findFirstFile(data.project.fileTree);
            if (firstFile) {
              setCurrentFile(firstFile);
              setCode(firstFile.content || '');
            }
          } else {
            const defaultFile = {
              id: generateId(),
              name: `main.${getExtension(data.project.language)}`,
              type: 'file',
              content: data.project.code || '',
              language: data.project.language,
              children: []
            };
            setFileTree([defaultFile]);
            setCurrentFile(defaultFile);
            setCode(defaultFile.content);
          }
        } else {
          toast.error(data.msg);
        }
      } catch (err) {
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // initialize output height based on editor area on mount
  useEffect(() => {
    const setInitial = () => {
      if (editorAreaRef.current) {
        const total = editorAreaRef.current.getBoundingClientRect().height;
        const initial = Math.max(150, Math.floor(total * 0.35));
        setOutputHeight(initial);
      }
    };
    setInitial();
    window.addEventListener('resize', setInitial);
    return () => window.removeEventListener('resize', setInitial);
  }, []);

  const findFirstFile = (nodes) => {
    for (let node of nodes) {
      if (node.type === 'file') return node;
      if (node.children && node.children.length > 0) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getExtension = (language) => {
    const extensions = {
      python: 'py', javascript: 'js', java: 'java', cpp: 'cpp',
      c: 'c', go: 'go', bash: 'sh'
    };
    return extensions[language] || 'txt';
  };

  const getLanguageFromExtension = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
      py: 'python', js: 'javascript', ts: 'typescript',
      java: 'java', cpp: 'cpp', c: 'c', go: 'go',
      sh: 'bash', html: 'html', css: 'css', json: 'json'
    };
    return map[ext] || 'text';
  };

  const getFileIcon = (type, name) => {
    if (type === 'folder') return '📁';
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
      py: '🐍', js: '⚙️', ts: '📘', java: '☕', cpp: '⚡',
      c: '🔧', go: '🐹', sh: '🔗', html: '🌐', css: '🎨',
      pdf: '📕', env: '🔐', txt: '📄', md: '📝', json: '{}'
    };
    return icons[ext] || '📄';
  };

  // Detect language for code execution (Piston API format)
  const detectLanguage = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      'py': 'python3',
      'js': 'javascript',
      'ts': 'typescript',
      'c': 'c',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'java': 'java',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'txt': 'text', 'md': 'text', 'json': 'text', 'yml': 'text', 
      'yaml': 'text', 'env': 'text', 'dotenv': 'text', 'pdf': 'pdf'
    };
    return languageMap[ext] || null;
  };

  // Fetch run history for current project
  const fetchRunHistory = async () => {
    if (!id) return; // No run history for scratch editor
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${api_base_url}/getRunHistory`, {
        mode: 'cors',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          projectId: id,
          limit: 15
        })
      });
      const data = await res.json();
      if (data.success) {
        setRunHistory(data.jobs || []);
      }
    } catch (err) {
      // Handle error silently
    }
  };

  // Load run history when component mounts
  useEffect(() => {
    if (id) {
      fetchRunHistory();
    }
  }, [id]);

  // Add new file/folder
  const addNewItem = () => {
    if (!newItemName.trim()) {
      toast.error('Name required');
      return;
    }

    const newItem = {
      id: generateId(),
      name: newItemName,
      type: createContext.type,
      ...(createContext.type === 'file' ? {
        content: '',
        language: getLanguageFromExtension(newItemName)
      } : {
        children: []
      })
    };

    const updatedTree = addItemToTree(fileTree, createContext.parentId, newItem);
    setFileTree(updatedTree);

    if (createContext.type === 'file') {
      setCurrentFile(newItem);
      setCode('');
    } else {
      setExpandedFolders(new Set([...expandedFolders, newItem.id]));
    }

    setNewItemName('');
    setShowCreateModal(false);
    setCreateContext(null);
    toast.success(`${createContext.type === 'file' ? 'File' : 'Folder'} created`);
  };

  const addItemToTree = (nodes, parentId, newItem) => {
    if (!parentId) {
      return [...nodes, newItem];
    }

    return nodes.map(node => {
      if (node.id === parentId && node.type === 'folder') {
        return {
          ...node,
          children: [...(node.children || []), newItem]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addItemToTree(node.children, parentId, newItem)
        };
      }
      return node;
    });
  };

  // Delete file/folder
  const deleteItem = (itemId) => {
    if (window.confirm('Delete this item?')) {
      const updatedTree = removeItemFromTree(fileTree, itemId);
      setFileTree(updatedTree);
      
      if (currentFile?.id === itemId) {
        const firstFile = findFirstFile(updatedTree);
        if (firstFile) {
          setCurrentFile(firstFile);
          setCode(firstFile.content || '');
        } else {
          setCurrentFile(null);
          setCode('');
        }
      }
      toast.success('Deleted');
    }
  };

  const removeItemFromTree = (nodes, itemId) => {
    return nodes
      .filter(node => node.id !== itemId)
      .map(node => {
        if (node.children) {
          return {
            ...node,
            children: removeItemFromTree(node.children, itemId)
          };
        }
        return node;
      });
  };

  // Toggle folder
  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Render file tree recursively
  const FileTreeNode = ({ node, depth = 0 }) => {
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`group mb-0.5 rounded flex items-center px-2 py-1 cursor-pointer transition-colors ${
            currentFile?.id === node.id
              ? 'bg-blue-600/30 text-blue-200'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.type === 'folder' ? (
            <>
              <button
                onClick={() => toggleFolder(node.id)}
                className="mr-1 flex-shrink-0 w-4 text-center text-xs hover:bg-gray-700 rounded"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
              <span className="text-lg mr-1">📁</span>
              <span className="flex-1 truncate text-sm">{node.name}</span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateContext({ parentId: node.id, type: 'file' });
                    setShowCreateModal(true);
                  }}
                  className="px-1.5 py-0.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 text-xs rounded transition-colors"
                  title="New File"
                >
                  +F
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateContext({ parentId: node.id, type: 'folder' });
                    setShowCreateModal(true);
                  }}
                  className="px-1.5 py-0.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs rounded transition-colors"
                  title="New Folder"
                >
                  +D
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(node.id);
                  }}
                  className="px-1.5 py-0.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs rounded transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-lg mr-1">{getFileIcon('file', node.name)}</span>
              <span 
                className="flex-1 truncate text-sm"
                onClick={() => {
                  setCurrentFile(node);
                  setCode(node.content || '');
                }}
              >
                {node.name}
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(node.id);
                  }}
                  className="px-1.5 py-0.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs rounded transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </div>

        {node.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {node.children.map(child => (
              <FileTreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Save current file
  const saveFile = async (silent = false) => {
    if (!currentFile) return;
    if (isSaving) return; // avoid concurrent saves

    setIsSaving(true);
    try {
      const updatedTree = updateFileContent(fileTree, currentFile.id, code);

      // If no project ID (scratch editor), only update local state
      if (!id) {
        setFileTree(updatedTree);
        setCurrentFile({ ...currentFile, content: code });
        if (!silent) toast.success('Local draft saved');
        setIsSaving(false);
        return;
      }

      const res = await fetch(`${api_base_url}/saveProject`, {
        mode: 'cors',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: localStorage.getItem('token'),
          projectId: id,
          code: code,
          fileTree: updatedTree
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFileTree(updatedTree);
        setCurrentFile({ ...currentFile, content: code });
        if (!silent) toast.success('Saved');
      } else {
        if (!silent) toast.error(data.msg);
      }
    } catch (err) {
      // Save failed; show user-friendly message without logging to console
      if (!silent) toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFileContent = (nodes, fileId, content) => {
    return nodes.map(node => {
      if (node.id === fileId && node.type === 'file') {
        return { ...node, content };
      }
      if (node.children) {
        return {
          ...node,
          children: updateFileContent(node.children, fileId, content)
        };
      }
      return node;
    });
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleSave = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [currentFile, code]);

  // Keyboard shortcut for run (Ctrl+Shift+Enter)
  useEffect(() => {
    const handleRun = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener('keydown', handleRun);
    return () => window.removeEventListener('keydown', handleRun);
  }, [currentFile, code]);

  // Auto-save: debounce saves when code changes
  useEffect(() => {
    if (!currentFile) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    // Debounce interval: 1.5s after last change
    saveTimeoutRef.current = setTimeout(() => {
      saveFile(true); // silent auto-save
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [code, currentFile?.id]);

  // Run code with intelligent language detection and store execution history
  const runCode = async () => {
    if (!currentFile) {
      toast.error('No file selected');
      return;
    }
    
    // If output pane is collapsed, expand it so user can see results
    if (outputCollapsed) setOutputCollapsed(false);

    const language = detectLanguage(currentFile.name);
    if (!language) {
      toast.error(`Unsupported file type: ${currentFile.name}`);
      return;
    }

    try {
      // Handle text-like files: show content in output (no execution)
      if (language === 'text') {
        setOutput(code || '(empty file)');
        setError(false);
        setShowHtmlPreview(false);
        return;
      }

      // Handle PDF files: provide a download link / preview if possible
      if (language === 'pdf') {
        try {
          const blob = new Blob([code], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const html = `<div style="padding:12px"><a href="${url}" download="${currentFile.name}" style="color: #2b6cb0; text-decoration: underline; cursor: pointer;">Download ${currentFile.name}</a><div style="margin-top:8px;"><iframe src="${url}" style="width:100%;height:480px;border:1px solid #222;"></iframe></div></div>`;
          setOutput('PDF preview ready');
          setHtmlPreviewCode(html);
          setShowHtmlPreview(true);
          setIsHtmlRunning(false);
        } catch (e) {
          setOutput('❌ PDF preview not available.');
          setError(true);
          setShowHtmlPreview(false);
        }
        return;
      }

      // Handle HTML: show in right-side preview panel with white background default
      if (language === 'html') {
        setIsHtmlRunning(true);
        // Add default white background and basic styling if not present
        let htmlContent = code;
        if (!htmlContent.includes('<style') && !htmlContent.includes('<link') && !htmlContent.includes('background')) {
          // Insert default styling
          htmlContent = htmlContent.replace('</head>', '<style>body { background-color: white; color: #333; margin: 0; padding: 10px; font-family: Arial, sans-serif; }</style></head>');
          if (!htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</html>', '</head><body></body></html>');
            htmlContent = htmlContent.replace('<body></body>', `<body><style>body { background-color: white; color: #333; margin: 0; padding: 10px; font-family: Arial, sans-serif; }</style>${code}</body>`);
          }
        }
        setHtmlPreviewCode(htmlContent);
        setShowHtmlPreview(true);
        setOutput('HTML rendered in preview panel →');
        setError(false);
        setIsHtmlRunning(false);
        return;
      }

      // Handle CSS preview by injecting into a small HTML wrapper
      if (language === 'css') {
        setIsHtmlRunning(true);
        const html = `<div style="background-color: white; padding:12px"><style>${code}</style><div class="code-preview" style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;">CSS Preview - Styled Box</div></div>`;
        setHtmlPreviewCode(html);
        setShowHtmlPreview(true);
        setOutput('CSS rendered in preview panel →');
        setError(false);
        setIsHtmlRunning(false);
        return;
      }

      setOutput('Executing...');
      setShowHtmlPreview(false);

      const className = currentFile.name.replace('.java', '').split('/').pop();
      const filename = language === 'python3' ? 'main.py' : 
                      language === 'javascript' ? 'main.js' :
                      language === 'typescript' ? 'main.ts' :
                      language === 'c' ? 'main.c' :
                      language === 'cpp' ? 'main.cpp' :
                      language === 'java' ? `${className}.java` :
                      currentFile.name;

      // ===== CREATE RUN JOB (if projectId exists) =====
      let jobId = null;
      const token = localStorage.getItem("token");
      if (id && token) {
        try {
          const jobRes = await fetch(`${api_base_url}/createRunJob`, {
            mode: 'cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: token,
              projectId: id,
              entryPoint: currentFile.name
            })
          });
          const jobData = await jobRes.json();
          if (jobData.success) {
            jobId = jobData.jobId;
          }
        } catch (e) {
          // Job creation failed, continue with execution anyway
        }
      }

      // Add timeout for execution
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          version: "*",
          files: [{
            filename: filename,
            content: code
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      let outputStr = '';
      let hasError = false;
      let errorMsg = '';

      // Handle compile errors (C, C++, Java)
      if (data.compile && data.compile.stderr) {
        outputStr = `❌ COMPILATION ERROR:\n\n${data.compile.stderr}`;
        hasError = true;
        errorMsg = data.compile.stderr;
      } else if (data.run) {
        // Handle runtime execution
        outputStr = data.run.output || '';
        const stderr = data.run.stderr || '';
        
        if (stderr) {
          outputStr = `❌ RUNTIME ERROR:\n\n${stderr}\n\n--- Output ---\n${outputStr}`;
          hasError = true;
          errorMsg = stderr;
        } else if (outputStr) {
          hasError = false;
        } else {
          outputStr = '✓ Program executed successfully with no output';
          hasError = false;
        }
      } else {
        outputStr = '⚠ No output received from execution';
        hasError = false;
      }

      setOutput(outputStr);
      setError(hasError);

      // ===== UPDATE RUN JOB WITH RESULTS (if jobId exists) =====
      if (jobId && token) {
        try {
          const updateRes = await fetch(`${api_base_url}/updateRunJob`, {
            mode: 'cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: token,
              jobId: jobId,
              status: hasError ? 'failed' : 'success',
              output: outputStr,
              error: errorMsg || ''
            })
          });
          const updateData = await updateRes.json();
          if (updateData.success) {
            // Refresh run history after successful update
            await fetchRunHistory();
          }
        } catch (e) {
          // Job update failed, but execution succeeded, so don't fail
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error('Code execution timeout (30s)');
        setOutput('❌ Execution timeout - code took too long to run');
      } else if (!err.message.includes('Failed to fetch')) {
        toast.error(`Error running code: ${err.message}`);
        setOutput(`❌ Error: ${err.message}`);
      } else {
        toast.error('Network error - check internet connection');
        setOutput('❌ Network error - please check your internet connection');
      }
      setError(true);
    }
  };

  // Output panel resizing handlers - NOW FOR VERTICAL/BOTTOM PANEL
  const handleOutputMouseDown = (e) => {
    e.preventDefault();
    setOutputResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!outputResizing || !editorAreaRef.current) return;
      const rect = editorAreaRef.current.getBoundingClientRect();
      // Calculate height from bottom - when dragging UP, height increases
      const newHeight = Math.max(120, rect.bottom - e.clientY);
      // constrain max height to 80% of editor area
      const maxH = Math.floor(rect.height * 0.8);
      setOutputHeight(Math.min(newHeight, maxH));
    };

    const handleMouseUp = () => {
      if (outputResizing) setOutputResizing(false);
    };

    if (outputResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [outputResizing]);

  // Handle sidebar resize
  const handleMouseDown = () => {
    setResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing) return;
      const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
      if (newWidth > 200 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  if (loading) {
    return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div ref={containerRef} className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-950 border-b border-gray-800/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="px-3 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-sm rounded transition-all duration-200 mr-2 border border-green-500/30"
            aria-label="Back to projects"
          >
            ← Back
          </button>
          <div className="text-2xl">💻</div>
          <div>
            <h1 className="text-white font-bold text-lg ml-1">{projectData?.name}</h1>
            <p className="text-gray-400 text-xs">{projectData?.language}</p>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-black border-r border-green-500/20 overflow-y-auto"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Toolbar */}
          <div className="sticky top-0 bg-gradient-to-b from-green-600/10 to-black border-b border-green-500/20 p-3 space-y-2">
            <h2 className="text-white font-semibold text-sm">File Explorer</h2>
            <div className="flex gap-2">
              <button
                onClick={() => saveFile(false)}
                className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all duration-200"
                title="Save"
              >
                {isSaving ? 'Saving...' : '💾 Save'}
              </button>
              <button
                onClick={() => {
                  setCreateContext({ parentId: null, type: 'file' });
                  setShowCreateModal(true);
                }}
                className="flex-1 px-2 py-1.5 text-xs bg-green-600/20 hover:bg-green-500/40 text-green-300 rounded transition-all duration-200 font-medium border border-green-500/30"
              >
                + File
              </button>
              <button
                onClick={() => {
                  setCreateContext({ parentId: null, type: 'folder' });
                  setShowCreateModal(true);
                }}
                className="flex-1 px-2 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-500/40 text-blue-300 rounded transition-all duration-200 font-medium border border-blue-500/30"
              >
                + Folder
              </button>
            </div>
          </div>

          {/* File Tree */}
          <div className="p-2">
            {fileTree.length === 0 ? (
              <div className="text-gray-500 text-xs p-4 text-center">
                No files. Create one!
              </div>
            ) : (
              fileTree.map(node => (
                <FileTreeNode key={node.id} node={node} depth={0} />
              ))
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 bg-gray-700 hover:bg-green-500 cursor-col-resize transition-colors"
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="bg-gradient-to-r from-gray-900/30 to-gray-950 border-b border-gray-800/50 px-4 py-2">
            {currentFile && (
              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span>{getFileIcon(currentFile.type, currentFile.name)}</span>
                  <span className="truncate max-w-[60vw]">{currentFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={runCode}
                    className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-xs font-medium rounded transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                    title="Run (Ctrl+Shift+Enter)"
                  >
                    ▶ Run
                  </button>
                  <button
                    onClick={() => setOutputCollapsed(!outputCollapsed)}
                    className="px-2 py-1 text-xs text-gray-200 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-200"
                    title={outputCollapsed ? 'Show output' : 'Hide output'}
                  >
                    {outputCollapsed ? '🔼' : '🔽'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div ref={editorAreaRef} className="flex-1 flex flex-col gap-1 overflow-hidden bg-black p-1">
            {/* Editor + HTML Preview Row */}
            <div className="flex-1 flex gap-1 overflow-hidden min-h-0">
              {/* Editor */}
              <div className="flex-1 overflow-hidden rounded bg-black border border-green-500/10">
                {currentFile ? (
                  <Editor2
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    language={currentFile.language || 'javascript'}
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    Select a file to edit
                  </div>
                )}
              </div>

              {/* HTML/CSS Preview Panel (Right Side) */}
              {showHtmlPreview && (
                <>
                  <div
                    className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-all duration-200"
                  />
                  <div className="w-96 overflow-hidden rounded bg-black border border-blue-500/30 flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-black">
                      <span className="text-white font-semibold text-sm">Preview</span>
                      <button
                        onClick={() => setShowHtmlPreview(false)}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-white">
                      {isHtmlRunning ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          Rendering...
                        </div>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: htmlPreviewCode }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Output Panel at Bottom */}
            {!outputCollapsed && (
              <div
                onMouseDown={handleOutputMouseDown}
                className="h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition-colors"
              />
            )}

            <div
              ref={outputRef}
              className="flex flex-col rounded bg-black border border-green-500/20 overflow-hidden transition-all duration-150"
              style={{ height: outputCollapsed ? 0 : `${outputHeight}px` }}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/20 bg-gradient-to-r from-green-600/10 to-black flex-shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowRunHistory(false)}
                    className={`text-sm font-semibold py-1 px-3 rounded transition-all duration-200 ${
                      !showRunHistory ? 'text-white bg-green-600/40 border border-green-500/50' : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    Output
                  </button>
                  {id && (
                    <button
                      onClick={() => setShowRunHistory(true)}
                      className={`text-sm font-semibold py-1 px-3 rounded transition-all duration-200 ${
                        showRunHistory ? 'text-white bg-green-600/40 border border-green-500/50' : 'text-gray-400 hover:text-green-400'
                      }`}
                    >
                      History ({runHistory.length})
                    </button>
                  )}
                </div>
                <span className="text-gray-400 text-xs">{outputCollapsed ? 'Collapsed' : `${Math.round(outputHeight)}px`}</span>
              </div>

              <div style={{ display: outputCollapsed ? 'none' : 'block' }} className="flex-1 overflow-auto">
                {!showRunHistory ? (
                  <pre
                    className={`p-4 text-xs font-mono whitespace-pre-wrap break-words ${
                      error ? 'text-red-400' : 'text-gray-300'
                    }`}
                  >
                    {output || '(output will appear here)'}
                  </pre>
                ) : (
                  <div className="p-4 space-y-3">
                    {runHistory.length === 0 ? (
                      <div className="text-center text-gray-400 py-6">No run history yet</div>
                    ) : (
                      runHistory.map((job) => (
                        <div
                          key={job._id}
                          className="glass border border-green-500/20 rounded-lg p-3 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setShowRunHistory(false);
                            setOutput(job.output);
                            setError(job.status === 'failed');
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  job.status === 'success'
                                    ? 'bg-green-500'
                                    : job.status === 'failed'
                                    ? 'bg-red-500'
                                    : job.status === 'running'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                              <span className="text-xs font-semibold text-white capitalize">{job.status}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {job.queued_at ? new Date(job.queued_at).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-300 line-clamp-2">
                            {job.output ? job.output.substring(0, 80) : job.error || 'No output'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div
          onClick={(e) => e.target.classList.contains('modal-bg') && setShowCreateModal(false)}
          className="modal-bg fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="glass border border-green-500/30 rounded-lg p-6 w-96 shadow-2xl">
            <h2 className="text-white font-bold mb-4 text-green-400">
              New {createContext?.type === 'file' ? 'File' : 'Folder'}
            </h2>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={createContext?.type === 'file' ? 'index.js' : 'src'}
              className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 mb-4 transition-all duration-200"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewItemName('');
                  setCreateContext(null);
                }}
                className="flex-1 px-4 py-2 border border-green-500/40 text-green-400 rounded hover:bg-green-500/10 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addNewItem}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-green-500/25"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Editor);
