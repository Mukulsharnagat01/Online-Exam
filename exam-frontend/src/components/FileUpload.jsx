// import React, { useState } from 'react';
// import axios from 'axios';
// import { Upload, X, Check } from 'lucide-react';

// const FileUpload = ({ onUploadSuccess, folder = 'general', accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png' }) => {
//     const [file, setFile] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [progress, setProgress] = useState(0);
//     const [uploadedUrl, setUploadedUrl] = useState('');

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             // Validate file size (max 50MB)
//             if (selectedFile.size > 50 * 1024 * 1024) {
//                 alert('File size should be less than 50MB');
//                 return;
//             }
//             setFile(selectedFile);
//             setUploadedUrl('');
//         }
//     };

//     const handleUpload = async () => {
//         if (!file) return;

//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('folder', folder);

//         try {
//             setUploading(true);
//             setProgress(0);

//             const token = localStorage.getItem('token');
//             const response = await axios.post(
//                 `${import.meta.env.VITE_API_URL}/api/upload`,
//                 formData,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'multipart/form-data'
//                     },
//                     onUploadProgress: (progressEvent) => {
//                         const percentCompleted = Math.round(
//                             (progressEvent.loaded * 100) / progressEvent.total
//                         );
//                         setProgress(percentCompleted);
//                     }
//                 }
//             );

//             setUploadedUrl(response.data.url);
//             if (onUploadSuccess) {
//                 onUploadSuccess(response.data.url, file.name);
//             }

//             // Reset after 3 seconds
//             setTimeout(() => {
//                 setFile(null);
//                 setProgress(0);
//             }, 3000);

//         } catch (error) {
//             console.error('Upload error:', error);
//             alert('Upload failed: ' + (error.response?.data?.message || error.message));
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleCancel = () => {
//         setFile(null);
//         setProgress(0);
//     };

//     return (
//         <div className="w-full max-w-md mx-auto p-4 border-2 border-dashed border-gray-300 rounded-lg">
//             {!file ? (
//                 <div className="text-center">
//                     <label className="cursor-pointer">
//                         <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
//                         <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
//                         <p className="text-sm text-gray-500 mb-2">Max file size: 50MB</p>
//                         <p className="text-xs text-gray-400">Supported: PDF, DOC, DOCX, JPG, PNG</p>
//                         <input
//                             type="file"
//                             className="hidden"
//                             onChange={handleFileChange}
//                             accept={accept}
//                         />
//                     </label>
//                 </div>
//             ) : (
//                 <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <div className="p-2 bg-blue-100 rounded">
//                                 <Upload className="w-5 h-5 text-blue-600" />
//                             </div>
//                             <div>
//                                 <p className="font-medium text-sm truncate max-w-xs">
//                                     {file.name}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                     {(file.size / 1024 / 1024).toFixed(2)} MB
//                                 </p>
//                             </div>
//                         </div>
//                         <button
//                             onClick={handleCancel}
//                             className="p-1 hover:bg-gray-100 rounded"
//                             disabled={uploading}
//                         >
//                             <X className="w-5 h-5 text-gray-500" />
//                         </button>
//                     </div>

//                     {uploading && (
//                         <div className="space-y-2">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                                 <div
//                                     className="bg-green-500 h-2 rounded-full transition-all duration-300"
//                                     style={{ width: `${progress}%` }}
//                                 />
//                             </div>
//                             <p className="text-xs text-center text-gray-600">
//                                 Uploading... {progress}%
//                             </p>
//                         </div>
//                     )}

//                     {uploadedUrl && (
//                         <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                             <div className="flex items-center space-x-2 text-green-700">
//                                 <Check className="w-5 h-5" />
//                                 <span className="text-sm font-medium">Upload Successful!</span>
//                             </div>
//                             <a
//                                 href={uploadedUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-xs text-blue-600 hover:underline truncate block mt-1"
//                             >
//                                 {uploadedUrl}
//                             </a>
//                         </div>
//                     )}

//                     {!uploading && !uploadedUrl && (
//                         <button
//                             onClick={handleUpload}
//                             className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                             Upload to AWS S3
//                         </button>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FileUpload;


import React, { useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const FileUpload = ({ onUploadSuccess, folder = 'general', accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png' }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size should be less than 100MB');
        return;
      }
      setFile(selectedFile);
      setUploadedUrl('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Request presigned URL from backend
      const presignRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload-url`, {
        filename: file.name,
        folder,
        contentType: file.type || 'application/octet-stream'
      });

      const { url, publicUrl } = presignRes.data;

      // Upload file directly to S3 using the presigned URL
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      const finalUrl = publicUrl || url.split('?')[0];
      setUploadedUrl(finalUrl);
      if (onUploadSuccess) onUploadSuccess(finalUrl, file.name);

      toast.success('File uploaded successfully!');
      setTimeout(() => {
        setFile(null);
        setProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
          <label className="cursor-pointer block">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <div className="text-gray-600 mb-2">
              <span className="text-green-600 font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-sm text-gray-500 mb-2">
              Max file size: 100MB
            </div>
            <div className="text-xs text-gray-400">
              Supported: {accept.replace(/\./g, '').toUpperCase()}
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={accept}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {folder} folder
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-200 rounded"
              disabled={uploading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-600">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {uploadedUrl && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Upload Successful!</span>
              </div>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline truncate block mt-1"
              >
                {uploadedUrl}
              </a>
            </div>
          )}

          {!uploading && !uploadedUrl && (
            <button
              onClick={handleUpload}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Upload to AWS S3
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;