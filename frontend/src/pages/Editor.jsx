import React, { useEffect, useState, useRef } from 'react';
import Editor2 from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
// Theme toggle removed

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
  // fileTypeSelected removed: users can provide full filename (with extension) when creating files
  const [resizing, setResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [showMobileFileExplorer, setShowMobileFileExplorer] = useState(false); // Mobile file explorer toggle
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Mobile detection
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

  // Run history state - now per-file
  const [runHistoryByFile, setRunHistoryByFile] = useState({}); // { fileId: [history] }
  const [showRunHistory, setShowRunHistory] = useState(false);
  
  // Mobile keyboard toolbar state
  const [showMobileKeyboard, setShowMobileKeyboard] = useState(false);
  const editorRef = useRef(null);

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('txt');

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

  // On mobile, start with output collapsed by default
  useEffect(() => {
    if (isMobile) {
      setOutputCollapsed(true);
    }
  }, [isMobile]);

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

  // Find a file in the current file tree by filename (exact match)
  const findFileByName = (nodes, filename) => {
    for (let node of nodes) {
      if (node.type === 'file' && node.name === filename) return node;
      if (node.children && node.children.length > 0) {
        const found = findFileByName(node.children, filename);
        if (found) return found;
      }
    }
    return null;
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

  // Fetch run history for current file
  const fetchRunHistory = async () => {
    if (!id || !currentFile) return; // No run history for scratch editor
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
        // Filter history to only show executions of the current file (by entryPoint/filename)
        const filteredJobs = (data.jobs || []).filter(job => job.entry_point === currentFile.name);
        // Store history per file - update history for current file
        setRunHistoryByFile(prev => ({
          ...prev,
          [currentFile.id]: filteredJobs
        }));
      }
    } catch (err) {
      // Handle error silently
    }
  };

  const clearRunHistory = async () => {
    if (!currentFile) return;
    
    // Clear from database
    const token = localStorage.getItem("token");
    if (!token || !id) {
      // If no token or no project, just clear client-side
      setRunHistoryByFile(prev => ({
        ...prev,
        [currentFile.id]: []
      }));
      toast.success('Run history cleared');
      return;
    }

    try {
      const deleteUrl = `${api_base_url}/deleteRunHistory`;
      const res = await fetch(deleteUrl, {
        mode: 'cors',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          projectId: id,
          entryPoint: currentFile.name
        })
      });
      
      const data = await res.json();
      if (data.success) {
        // Clear from database successful, update client-side
        setRunHistoryByFile(prev => ({
          ...prev,
          [currentFile.id]: []
        }));
        toast.success(`Run history cleared (${data.deletedCount || 0} entries deleted)`);
      } else {
        toast.error(data.msg || 'Failed to clear history');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      toast.error(err.message || 'Error clearing history');
    }
  };

  // Mobile keyboard symbols
  const mobileSymbols = [
    { label: '{', char: '{' },
    { label: '}', char: '}' },
    { label: '[', char: '[' },
    { label: ']', char: ']' },
    { label: '(', char: '(' },
    { label: ')', char: ')' },
    { label: '"', char: '"' },
    { label: "'", char: "'" },
    { label: '`', char: '`' },
    { label: ';', char: ';' },
    { label: ':', char: ':' },
    { label: ',', char: ',' },
    { label: '.', char: '.' },
    { label: '=', char: '=' },
    { label: '>', char: '>' },
    { label: '<', char: '<' },
    { label: '&', char: '&' },
    { label: '|', char: '|' },
  ];

  // Insert symbol into editor
  const insertSymbol = (char) => {
    const newCode = code + char;
    setCode(newCode);
  };

  // Load run history when component mounts or file changes
  useEffect(() => {
    if (id && currentFile) {
      fetchRunHistory();
    }
  }, [id, currentFile?.id]);

  // === UTILITY FUNCTIONS FOR COPY, EXPORT, SHARE ===

  // Copy current code to clipboard
  const copyToClipboard = () => {
    if (!currentFile || !code) {
      toast.error('No code to copy');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Code copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  // Export code as file
  const exportCode = (format) => {
    if (!currentFile || !code) {
      toast.error('No code to export');
      return;
    }

    let filename = currentFile.name;
    let content = code;
    let mimeType = 'text/plain';

    // Determine file extension and MIME type
    if (format === 'original') {
      // Keep original extension
      mimeType = getMimeType(filename);
    } else if (format === 'txt') {
      filename = currentFile.name.split('.')[0] + '.txt';
      mimeType = 'text/plain';
    } else if (format === 'pdf') {
      // Generate PDF using jsPDF
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const maxWidth = pageWidth - 2 * margin;
        const lineHeight = 5;

        let yPosition = margin;

        // Add title
        pdf.setFontSize(16);
        pdf.setTextColor(0, 122, 204); // Blue color
        pdf.text(`📄 ${currentFile.name}`, margin, yPosition);
        yPosition += 10;

        // Add metadata
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100); // Gray color
        pdf.text(`Language: ${currentFile.language || 'text'}`, margin, yPosition);
        yPosition += 5;
        pdf.text(`Date: ${new Date().toLocaleString()}`, margin, yPosition);
        yPosition += 10;

        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Add code content
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0); // Black text
        const codeLines = code.split('\n');
        
        codeLines.forEach(line => {
          // Check if we need a new page
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          // Split long lines
          const wrappedLines = pdf.splitTextToSize(line, maxWidth);
          wrappedLines.forEach(wrappedLine => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(wrappedLine, margin, yPosition);
            yPosition += lineHeight;
          });
        });

        // Add footer
        const pageCount = pdf.internal.pages.length - 1;
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.text(
            `Generated by CatalyX | Page ${i} of ${pageCount}`,
            margin,
            pageHeight - margin + 5
          );
        }

        // Download PDF
        const filename = currentFile.name.split('.')[0] + '.pdf';
        pdf.save(filename);
        toast.success(`Exported as ${filename}`);
      } catch (error) {
        toast.error('Failed to generate PDF');
        console.error(error);
      }
      setShowExportModal(false);
      return;
    }

    // Create blob and download for original and txt formats
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported as ${filename}`);
    setShowExportModal(false);
  };

  // Get MIME type from filename
  const getMimeType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'js': 'text/javascript',
      'py': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'txt': 'text/plain',
      'md': 'text/markdown'
    };
    return mimeTypes[ext] || 'text/plain';
  };

  // Add new file/folder
  const addNewItem = () => {
    if (!newItemName.trim()) {
      toast.error('Name required');
      return;
    }

    // For files, keep the name as provided by the user (allow them to include extension)
    const finalName = newItemName;

    const newItem = {
      id: generateId(),
      name: finalName,
      type: createContext.type,
      ...(createContext.type === 'file' ? {
        content: '',
        language: getLanguageFromExtension(finalName)
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
    
    // On mobile, expand output when run button clicked
    if (isMobile && outputCollapsed) {
      setOutputCollapsed(false);
    }
    // If output pane is collapsed on desktop, expand it so user can see results
    if (!isMobile && outputCollapsed) setOutputCollapsed(false);

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

        // Inline any local CSS/JS referenced via relative <link> or <script src=> from the project file tree
        const inlineLocalAssets = (html) => {
          let result = html;
          try {
            // Inline CSS linked files
            result = result.replace(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
              if (/^https?:\/\//i.test(href) || href.startsWith('//')) return match;
              const rel = href.split('/').pop();
              const file = findFileByName(fileTree, rel);
              if (file && file.content && rel.endsWith('.css')) {
                return `<style>${file.content}</style>`;
              }
              return match;
            });

            // Inline JS script files
            result = result.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (match, src) => {
              if (/^https?:\/\//i.test(src) || src.startsWith('//')) return match;
              const rel = src.split('/').pop();
              const file = findFileByName(fileTree, rel);
              if (file && file.content && (rel.endsWith('.js') || rel.endsWith('.ts'))) {
                return `<script>${file.content}</script>`;
              }
              return match;
            });
          } catch (e) {
            // If inlining fails, return original html
            return html;
          }
          return result;
        };

        htmlContent = inlineLocalAssets(htmlContent);
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
            // Refresh run history after successful update (now per-file)
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

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div ref={containerRef} className="h-screen relative overflow-hidden flex flex-col bg-transparent">
      {/* Sci‑fi / techy background layers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, #03040a 0%, #071421 40%, #000000 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0,255,200,0.04), transparent 12%), radial-gradient(circle at 85% 80%, rgba(100,150,255,0.03), transparent 18%)'}} />
        <div className="absolute inset-0 mix-blend-overlay opacity-10" style={{backgroundImage: 'url(/code2.png)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 60px)', backgroundSize: '100% 60px', opacity: 0.06, animation: 'moveGrid 30s linear infinite'}} />
      </div>
      <style>{`
        @keyframes moveGrid { from { background-position: 0 0; } to { background-position: 0 60px; } }
        /* Hide scrollbars globally */
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-950 border-b border-gray-800/50 px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/home')}
            className="px-2 sm:px-3 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs sm:text-sm rounded transition-all duration-200 border border-green-500/30 flex-shrink-0 active:scale-95"
            aria-label="Back to projects"
            title="Back"
          >
            ← 
          </button>
          <div className="text-lg sm:text-2xl flex-shrink-0">💻</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-bold text-sm sm:text-lg truncate">{projectData?.name}</h1>
            <p className="text-gray-400 text-xs hidden sm:block">{projectData?.language}</p>
          </div>
        </div>
        
        {/* Mobile File Explorer Toggle */}
        {isMobile && (
          <button
            onClick={() => setShowMobileFileExplorer(!showMobileFileExplorer)}
            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs rounded transition-all duration-200 border border-blue-500/30 flex-shrink-0 active:scale-95"
            title="Toggle Files"
          >
            📁
          </button>
        )}

        {/* Action Buttons Container - Responsive Layout */}
        <div className="flex gap-1 sm:gap-2 flex-shrink-0 items-center">
          {/* Run Button - Primary Action */}
          <button
            onClick={runCode}
            className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-xs font-medium rounded transition-all duration-200 active:scale-95"
            title="Run Code (Ctrl+Shift+Enter)"
          >
            ▶ <span className="hidden sm:inline">Run</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 text-xs rounded transition-all duration-200 border border-cyan-500/30 active:scale-95 whitespace-nowrap"
            title="Copy code"
          >
            📋 <span className="hidden sm:inline">Copy</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-2 py-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 text-xs rounded transition-all duration-200 border border-orange-500/30 active:scale-95 whitespace-nowrap"
            title="Export code"
          >
            💾 <span className="hidden sm:inline">Export</span>
          </button>

          {/* Theme toggle removed */}
        </div>
      </div>

      {/* Main Area - Mobile Responsive Layout */}
      <div className={`flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}>
        {/* Sidebar/File Explorer - Desktop: Left, Mobile: Modal/Collapsible */}
        {!isMobile && (
          <>
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
                className="flex-1 px-2 py-1 text-xs bg-green-600/20 hover:bg-green-500/40 text-green-300 rounded transition-all duration-200 border border-green-500/30"
              >
                +F
              </button>
              <button
                onClick={() => {
                  setCreateContext({ parentId: null, type: 'folder' });
                  setShowCreateModal(true);
                }}
                className="flex-1 px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-500/40 text-blue-300 rounded transition-all duration-200 border border-blue-500/30"
              >
                +D
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

            {/* Resize Handle - Desktop Only */}
            <div
              onMouseDown={handleMouseDown}
              className="w-1 bg-gray-700 hover:bg-green-500 cursor-col-resize transition-colors"
            />
          </>
        )}

        {/* Mobile File Explorer - Modal/Overlay */}
        {isMobile && showMobileFileExplorer && (
          <div className="fixed inset-0 z-40 flex touch-none">
            <div className="w-4/5 max-w-xs bg-black border-r border-green-500/20 overflow-y-auto shadow-lg flex flex-col">
              {/* Mobile Toolbar */}
              <div className="sticky top-0 bg-gradient-to-b from-green-600/10 to-black border-b border-green-500/20 p-3 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold text-sm">📁 Files</h2>
                  <button
                    onClick={() => setShowMobileFileExplorer(false)}
                    className="text-gray-400 hover:text-white text-lg transition-colors"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      saveFile(false);
                      setShowMobileFileExplorer(false);
                    }}
                    className="flex-1 px-2 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all duration-200 font-medium"
                    title="Save"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => {
                      setCreateContext({ parentId: null, type: 'file' });
                      setShowCreateModal(true);
                    }}
                    className="flex-1 px-2 py-2 text-xs bg-green-600/20 hover:bg-green-500/40 text-green-300 rounded transition-all duration-200 font-medium border border-green-500/30"
                  >
                    +F
                  </button>
                  <button
                    onClick={() => {
                      setCreateContext({ parentId: null, type: 'folder' });
                      setShowCreateModal(true);
                    }}
                    className="flex-1 px-2 py-2 text-xs bg-blue-600/20 hover:bg-blue-500/40 text-blue-300 rounded transition-all duration-200 font-medium border border-blue-500/30"
                  >
                    +D
                  </button>
                </div>
              </div>

              {/* Mobile File Tree */}
              <div className="p-2 overflow-y-auto flex-1">
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
            {/* Close Overlay Click */}
            <div
              className="flex-1 bg-black/70 cursor-pointer active:bg-black/80 transition-colors"
              onClick={() => setShowMobileFileExplorer(false)}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
          {/* Tab Bar */}
          <div className="bg-gradient-to-r from-gray-900/30 to-gray-950 border-b border-gray-800/50 px-3 sm:px-4 py-2">
            {currentFile && (
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{getFileIcon(currentFile.type, currentFile.name)}</span>
                  <span className="truncate">{currentFile.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {!isMobile && (
                    <>
                      <button
                        onClick={() => setOutputCollapsed(!outputCollapsed)}
                        className="px-2 py-1 text-xs text-gray-200 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-200"
                        title={outputCollapsed ? 'Show output' : 'Hide output'}
                      >
                        {outputCollapsed ? '🔼' : '🔽'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div ref={editorAreaRef} className="flex-1 flex flex-col gap-1 overflow-hidden bg-black p-1">
            {/* Editor + HTML Preview Row (Desktop - Horizontal Layout) */}
            {!isMobile && (
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
                        minimap: { enabled: !isMobile },
                        fontSize: isMobile ? 12 : 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: isMobile ? 'on' : 'off',
                        wrappingIndent: 'same',
                        folding: !isMobile,
                        renderWhitespace: isMobile ? 'none' : 'selection',
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
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
            )}

            {/* Mobile Editor (Vertical Stack) */}
            {isMobile && (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Mobile Editor */}
                <div className="flex-1 overflow-hidden rounded bg-black border border-green-500/10 min-h-0">
                  {currentFile ? (
                    <>
                      <Editor2
                        ref={editorRef}
                        value={code}
                        onChange={(value) => {
                          setCode(value || '');
                          setShowMobileKeyboard(true);
                        }}
                        theme="vs-dark"
                        language={currentFile.language || 'javascript'}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                          wrappingIndent: 'same',
                          folding: false,
                          renderWhitespace: 'none',
                          scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
                        }}
                      />
                      {/* Mobile Keyboard Toolbar - appears when typing */}
                      {showMobileKeyboard && (
                        <div className="bg-gray-900 border-t border-gray-700 p-2 overflow-x-auto">
                          <div className="flex gap-1 whitespace-nowrap">
                            {mobileSymbols.map((symbol, idx) => (
                              <button
                                key={idx}
                                onClick={() => insertSymbol(symbol.char)}
                                className="px-2 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded text-xs font-medium transition-colors"
                              >
                                {symbol.label}
                              </button>
                            ))}
                            <button
                              onClick={() => setShowMobileKeyboard(false)}
                              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs font-medium transition-colors ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 p-4 text-center">
                      📱 Select a file to edit
                    </div>
                  )}
                </div>

                {/* Mobile Output Preview */}
                {showHtmlPreview && (
                  <div className="h-48 overflow-auto rounded bg-black border border-blue-500/30 border-t mt-1">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-black flex-shrink-0">
                      <span className="text-white font-semibold text-xs">Preview</span>
                      <button
                        onClick={() => setShowHtmlPreview(false)}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="bg-white text-xs">
                      {isHtmlRunning ? (
                        <div className="flex items-center justify-center p-4 text-gray-400">
                          Rendering...
                        </div>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: htmlPreviewCode }}
                          style={{ width: '100%' }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Output Panel at Bottom - Mobile Optimized */}
            {!outputCollapsed && (
              <div
                onMouseDown={handleOutputMouseDown}
                onTouchStart={handleOutputMouseDown}
                className="h-1 bg-gray-700 hover:bg-blue-500 active:bg-blue-400 cursor-row-resize transition-colors"
              />
            )}

            <div
              ref={outputRef}
              className={`flex flex-col rounded bg-black border border-green-500/20 overflow-hidden transition-all duration-150`}
              style={isMobile ? { height: outputCollapsed ? 0 : `${outputHeight}px` } : { height: outputCollapsed ? 0 : `${outputHeight}px` }}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/20 bg-gradient-to-r from-green-600/10 to-black flex-shrink-0 gap-2 overflow-x-auto">
                <button
                  onClick={() => setShowRunHistory(false)}
                  className={`text-xs sm:text-sm font-semibold py-1 px-2 sm:px-3 rounded transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    !showRunHistory ? 'text-white bg-green-600/40 border border-green-500/50' : 'text-gray-400 hover:text-green-400'
                  }`}
                >
                  Output
                </button>
                {id && (
                  <button
                    onClick={() => setShowRunHistory(true)}
                    className={`text-xs sm:text-sm font-semibold py-1 px-2 sm:px-3 rounded transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      showRunHistory ? 'text-white bg-green-600/40 border border-green-500/50' : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    History ({(runHistoryByFile[currentFile?.id] || []).length})
                  </button>
                )}
                {showRunHistory && (runHistoryByFile[currentFile?.id] || []).length > 0 && (
                  <button
                    onClick={clearRunHistory}
                    className="text-xs sm:text-sm font-semibold py-1 px-2 sm:px-3 rounded transition-all duration-200 whitespace-nowrap flex-shrink-0 text-red-400 hover:text-red-300 border border-red-500/20 bg-red-600/5"
                    title="Clear history"
                  >
                    Clear
                  </button>
                )}
                {!isMobile && (
                  <span className="text-gray-400 text-xs ml-auto flex-shrink-0">{outputCollapsed ? 'Collapsed' : `${Math.round(outputHeight)}px`}</span>
                )}
              </div>

              <div style={{ display: outputCollapsed ? 'none' : 'block' }} className="flex-1 overflow-auto">
                {!showRunHistory ? (
                  <pre
                    className={`p-3 sm:p-4 text-xs font-mono whitespace-pre-wrap break-words ${
                      error ? 'text-red-400' : 'text-gray-300'
                    }`}
                  >
                    {output || '(output will appear here)'}
                  </pre>
                ) : (
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    {(runHistoryByFile[currentFile?.id] || []).length === 0 ? (
                      <div className="text-center text-gray-400 py-4 text-xs">No run history yet</div>
                    ) : (
                      (runHistoryByFile[currentFile?.id] || []).map((job) => (
                        <div
                          key={job._id}
                          className="glass border border-green-500/20 rounded-lg p-2 sm:p-3 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setShowRunHistory(false);
                            setOutput(job.output);
                            setError(job.status === 'failed');
                          }}
                        >
                          <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                                  job.status === 'success'
                                    ? 'bg-green-500'
                                    : job.status === 'failed'
                                    ? 'bg-red-500'
                                    : job.status === 'running'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                              <span className="text-xs font-semibold text-white capitalize truncate">{job.status}</span>
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

      {/* Create Modal - Mobile Optimized */}
      {showCreateModal && (
        <div
          onClick={(e) => e.target.classList.contains('modal-bg') && setShowCreateModal(false)}
          className="modal-bg fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
        >
          <div className="glass border border-green-500/30 rounded-t-lg sm:rounded-lg p-5 sm:p-6 w-full sm:w-96 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-green-400 font-bold mb-4 text-lg sm:text-xl">
              ➕ New {createContext?.type === 'file' ? 'File' : 'Folder'}
            </h2>
            
            {/* No file type selection — users provide full filename (with extension) if desired */}

            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={createContext?.type === 'file' ? 'filename' : 'folder name'}
              className="w-full px-3 py-2 sm:py-3 bg-black border border-green-500/30 rounded text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 mb-4 transition-all duration-200"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
            />
            
            {/* Show filename preview as entered */}
            {createContext?.type === 'file' && (
              <p className="text-gray-400 text-xs mb-4">
                File will be created as: <span className="text-green-400 font-medium">{newItemName || 'filename'}</span>
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Share Modal */}
      {/* Export Modal */}
      {showExportModal && (
        <div
          onClick={(e) => e.target.classList.contains('modal-bg') && setShowExportModal(false)}
          className="modal-bg fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
        >
          <div className="glass border border-orange-500/30 rounded-t-lg sm:rounded-lg p-5 sm:p-6 w-full sm:w-96 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-orange-400 font-bold mb-4 text-lg sm:text-xl">
              💾 Export Code
            </h2>
            
            <p className="text-gray-300 text-sm mb-4">Select export format:</p>
            
            <div className="space-y-2 mb-6">
              <button
                onClick={() => exportCode('original')}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-all duration-200 text-left text-sm"
              >
                <span className="font-medium">Original Format</span>
                <span className="text-gray-400 text-xs block">Export as {currentFile?.name}</span>
              </button>
              
              <button
                onClick={() => exportCode('txt')}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-all duration-200 text-left text-sm"
              >
                <span className="font-medium">Text File (.txt)</span>
                <span className="text-gray-400 text-xs block">Plain text format</span>
              </button>
              
              <button
                onClick={() => exportCode('pdf')}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-all duration-200 text-left text-sm"
              >
                <span className="font-medium">Print as PDF</span>
                <span className="text-gray-400 text-xs block">Use browser print (Ctrl+P)</span>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full px-4 py-2 border border-orange-500/40 text-orange-400 rounded hover:bg-orange-500/10 transition-all duration-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Editor);
