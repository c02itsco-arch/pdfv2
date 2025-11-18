
import React, { useState, useCallback } from 'react';
// FIX: Renamed imported `File` component to `FileIcon` to avoid a name collision with the browser's built-in `File` type. This resolves the TypeScript errors on lines 29 and 38 where `file.type` could not be resolved.
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLDivElement | HTMLLabelElement>
  // to match the element it's attached to (HTMLLabelElement) and prevent a TypeScript type error.
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
    }
  }, [selectedFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
       const newFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
       const updatedFiles = [...selectedFiles, ...newFiles];
       setSelectedFiles(updatedFiles);
       e.target.value = ''; // Reset input value
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(files => files.filter(file => file.name !== fileName));
  };
  
  const handleProcessClick = () => {
    if (selectedFiles.length > 0) {
      onFilesSelect(selectedFiles);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-full">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">อัปโหลดเอกสารทรัพย์สิน (PDF)</h2>
      <label
        htmlFor="dropzone-file"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <p className="mb-2 text-sm text-slate-500">
            <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
            </p>
            <p className="text-xs text-slate-400">รองรับเฉพาะไฟล์ PDF เท่านั้น</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="application/pdf" multiple onChange={handleChange} disabled={isProcessing} />
      </label>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
            <h3 className="text-md font-medium text-slate-600 mb-2">ไฟล์ที่เลือก:</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {selectedFiles.map((file, i) => (
                <li key={i} className="flex items-center justify-between bg-slate-100 p-2 rounded-md text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {/* FIX: Use the renamed `FileIcon` component. */}
                        <FileIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="truncate" title={file.name}>{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(file.name)} disabled={isProcessing} className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-50">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </li>
            ))}
            </ul>
        </div>
      )}

      <button
        onClick={handleProcessClick}
        disabled={isProcessing || selectedFiles.length === 0}
        className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>กำลังประมวลผล...</span>
          </>
        ) : (
          'เริ่มวิเคราะห์ข้อมูล'
        )}
      </button>
    </div>
  );
};

export default FileUpload;