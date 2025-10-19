import React, { useState } from 'react';

/**
 * EDUCATIONAL FILE UPLOAD COMPONENT
 * This demonstrates how file uploads work in the browser
 */
const FileUploadTest = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Log file information
    console.log('=== FILE OBJECT DETAILS ===');
    console.log('File object:', file);
    console.log('Name:', file.name);
    console.log('Size (bytes):', file.size);
    console.log('Size (KB):', (file.size / 1024).toFixed(2));
    console.log('Size (MB):', (file.size / 1024 / 1024).toFixed(2));
    console.log('Type (MIME):', file.type);
    console.log('Last modified:', new Date(file.lastModified));
    console.log('===========================');

    // Check memory usage (if available)
    if (performance.memory) {
      console.log('=== BROWSER MEMORY ===');
      console.log('Used JS Heap (MB):', (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2));
      console.log('Total JS Heap (MB):', (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2));
      console.log('Heap Limit (MB):', (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2));
      console.log('======================');
    }

    // Check localStorage (to show files DON'T go here)
    console.log('=== BROWSER STORAGE ===');
    console.log('localStorage used:', Object.keys(localStorage).length, 'items');
    let localStorageSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageSize += localStorage[key].length + key.length;
      }
    }
    console.log('localStorage size (bytes):', localStorageSize);
    console.log('localStorage size (KB):', (localStorageSize / 1024).toFixed(2));
    console.log('⚠️ File is NOT in localStorage!');
    console.log('=======================');

    // Set state for UI display
    setFileInfo({
      name: file.name,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2),
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString()
    });
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('test-file-input');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file first!');
      return;
    }

    setUploadStatus('Creating FormData...');
    console.log('=== CREATING FORMDATA ===');
    
    // Create FormData (built-in Web API)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', 'Test upload');
    formData.append('timestamp', Date.now());
    
    console.log('FormData created:', formData);
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    console.log('=========================');

    setUploadStatus('Sending HTTP request...');
    
    // Simulate upload (replace with actual API call)
    try {
      // Uncomment to use real API:
      // const response = await axios.post('/api/files/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadStatus('✅ Upload successful! (Simulated)');
      console.log('Upload complete. File object will be garbage collected soon.');
      
      // Clear file input
      fileInput.value = '';
      setFileInfo(null);
      
    } catch (error) {
      setUploadStatus('❌ Upload failed: ' + error.message);
      console.error('Upload error:', error);
    }
  };

  const demonstrateFileReader = () => {
    const fileInput = document.getElementById('test-file-input');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file first!');
      return;
    }

    console.log('=== FileReader DEMO ===');
    console.log('Reading file as Data URL (base64)...');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataURL = e.target.result;
      console.log('File as Data URL (first 100 chars):', dataURL.substring(0, 100) + '...');
      console.log('Data URL length:', dataURL.length);
      console.log('Original file size:', file.size);
      console.log('Base64 size increase:', ((dataURL.length / file.size - 1) * 100).toFixed(2) + '%');
      
      // Show it's too big for localStorage
      try {
        localStorage.setItem('test_file', dataURL);
        console.log('✅ File stored in localStorage (but this is a BAD practice!)');
        localStorage.removeItem('test_file');
      } catch (e) {
        console.log('❌ File too large for localStorage!', e.message);
      }
    };

    reader.readAsDataURL(file);
    console.log('======================');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎓 File Upload Test & Learning</h1>
      <p>Open DevTools Console (F12) to see detailed logs!</p>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Step 1: Select a File</h2>
        <input 
          id="test-file-input"
          type="file" 
          onChange={handleFileSelect}
          style={{ padding: '10px' }}
        />
      </div>

      {fileInfo && (
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>📄 File Information (From Memory)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Name:</td>
                <td style={{ padding: '8px' }}>{fileInfo.name}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Size (bytes):</td>
                <td style={{ padding: '8px' }}>{fileInfo.size.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Size (KB):</td>
                <td style={{ padding: '8px' }}>{fileInfo.sizeKB} KB</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Size (MB):</td>
                <td style={{ padding: '8px' }}>{fileInfo.sizeMB} MB</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Type:</td>
                <td style={{ padding: '8px' }}>{fileInfo.type || 'unknown'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Last Modified:</td>
                <td style={{ padding: '8px' }}>{fileInfo.lastModified}</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '4px' }}>
            <strong>⚠️ Important:</strong> This file is stored in <strong>browser's RAM (memory)</strong>, 
            NOT in localStorage or sessionStorage!
          </div>
        </div>
      )}

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Step 2: Demonstrate Actions</h2>
        
        <button 
          onClick={handleUpload}
          style={{ 
            padding: '12px 24px', 
            marginRight: '10px', 
            marginBottom: '10px',
            background: '#4caf50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Upload with FormData
        </button>

        <button 
          onClick={demonstrateFileReader}
          style={{ 
            padding: '12px 24px', 
            marginRight: '10px', 
            marginBottom: '10px',
            background: '#2196f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Read File (FileReader)
        </button>

        {uploadStatus && (
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            background: uploadStatus.includes('✅') ? '#d4edda' : '#d1ecf1',
            borderRadius: '4px',
            color: '#000'
          }}>
            {uploadStatus}
          </div>
        )}
      </div>

      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
        <h2>💡 Key Learnings</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>File Object:</strong> A JavaScript object representing the file in memory (RAM)</li>
          <li><strong>FormData:</strong> A built-in Web API (no library needed) to construct form data including files</li>
          <li><strong>Memory vs Storage:</strong> Files stay in RAM temporarily, NOT in localStorage</li>
          <li><strong>Browser Limits:</strong> RAM-based (hundreds of MB to GB), not 5MB localStorage limit</li>
          <li><strong>Upload Process:</strong> File is sent immediately via HTTP, then cleared from memory</li>
          <li><strong>FileReader:</strong> Optional API to read file contents as text/base64 (usually not needed)</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f8d7da', borderRadius: '8px' }}>
        <h2>🚨 Common Misconceptions</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>WRONG:</strong> "Files are stored in localStorage" → <strong>RIGHT:</strong> "Files are in RAM"</li>
          <li><strong>WRONG:</strong> "FormData is from a library" → <strong>RIGHT:</strong> "FormData is built-in"</li>
          <li><strong>WRONG:</strong> "5MB limit applies" → <strong>RIGHT:</strong> "RAM limit applies (much larger)"</li>
          <li><strong>WRONG:</strong> "Files persist in browser" → <strong>RIGHT:</strong> "Files are uploaded then cleared"</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadTest;
