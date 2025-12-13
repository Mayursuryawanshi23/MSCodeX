// Code execution engine with automatic language detection
// Handles: C, Python, C++, HTML, CSS, JS, Java

const executeCode = async (filename, code) => {
  // Detect language from file extension
  const language = detectLanguage(filename);
  
  if (!language) {
    throw new Error(`Unsupported file type: ${filename}`);
  }

  // Route to appropriate executor
  switch (language) {
    case 'python':
      return await executePython(code);
    case 'javascript':
      return await executeJavaScript(code);
    case 'c':
      return await executeC(code);
    case 'cpp':
      return await executeCPP(code);
    case 'java':
      return await executeJava(code, filename);
    case 'html':
      return await executeHTML(code);
    case 'css':
      return await executeCSS(code);
    default:
      throw new Error(`Language not supported: ${language}`);
  }
};

// Detect language from file extension
const detectLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  
  const languageMap = {
    'py': 'python',
    'js': 'javascript',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'java': 'java',
    'html': 'html',
    'htm': 'html',
    'css': 'css'
  };
  
  return languageMap[ext] || null;
};

// Python Executor
const executePython = async (code) => {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python3",
        version: "*",
        files: [{
          filename: "main.py",
          content: code
        }]
      })
    });

    const data = await response.json();
    
    if (data.run) {
      return {
        success: true,
        output: data.run.output || '',
        stderr: data.run.stderr || '',
        exitCode: data.run.code
      };
    }
    
    throw new Error('Execution failed');
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

// JavaScript Executor (Node.js)
const executeJavaScript = async (code) => {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        version: "*",
        files: [{
          filename: "main.js",
          content: code
        }]
      })
    });

    const data = await response.json();
    
    if (data.run) {
      return {
        success: true,
        output: data.run.output || '',
        stderr: data.run.stderr || '',
        exitCode: data.run.code
      };
    }
    
    throw new Error('Execution failed');
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

// C Executor
const executeC = async (code) => {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "c",
        version: "*",
        files: [{
          filename: "main.c",
          content: code
        }]
      })
    });

    const data = await response.json();
    
    if (data.run) {
      return {
        success: true,
        output: data.run.output || '',
        stderr: data.run.stderr || '',
        exitCode: data.run.code,
        compile: data.compile ? {
          stdout: data.compile.stdout || '',
          stderr: data.compile.stderr || '',
          exitCode: data.compile.code
        } : null
      };
    }
    
    throw new Error('Execution failed');
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

// C++ Executor
const executeCPP = async (code) => {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "cpp",
        version: "*",
        files: [{
          filename: "main.cpp",
          content: code
        }]
      })
    });

    const data = await response.json();
    
    if (data.run) {
      return {
        success: true,
        output: data.run.output || '',
        stderr: data.run.stderr || '',
        exitCode: data.run.code,
        compile: data.compile ? {
          stdout: data.compile.stdout || '',
          stderr: data.compile.stderr || '',
          exitCode: data.compile.code
        } : null
      };
    }
    
    throw new Error('Execution failed');
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

// Java Executor
const executeJava = async (code, filename) => {
  try {
    // Extract class name from filename or use default
    const className = filename.replace('.java', '').split('/').pop();
    
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "java",
        version: "*",
        files: [{
          filename: `${className}.java`,
          content: code
        }]
      })
    });

    const data = await response.json();
    
    if (data.run) {
      return {
        success: true,
        output: data.run.output || '',
        stderr: data.run.stderr || '',
        exitCode: data.run.code,
        compile: data.compile ? {
          stdout: data.compile.stdout || '',
          stderr: data.compile.stderr || '',
          exitCode: data.compile.code
        } : null
      };
    }
    
    throw new Error('Execution failed');
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

// HTML Executor (Browser preview)
const executeHTML = async (code) => {
  try {
    return {
      success: true,
      output: code,
      type: 'html',
      isPreview: true,
      stderr: ''
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

// CSS Executor (Return as style)
const executeCSS = async (code) => {
  try {
    return {
      success: true,
      output: code,
      type: 'css',
      isStyle: true,
      stderr: ''
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      output: '',
      stderr: err.message
    };
  }
};

export { executeCode, detectLanguage };
