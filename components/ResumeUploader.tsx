import React, { useCallback } from 'react';
import { UploadCloud, FileText, Sparkles } from './Icons';

interface ResumeUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onFileUpload, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="relative group w-full max-w-lg mx-auto">
      {/* Glowing background effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 ${isLoading ? 'opacity-0' : ''}`}></div>
      
      <div 
        className={`relative flex flex-col items-center justify-center w-full rounded-2xl p-8 transition-all duration-300
          ${isLoading 
            ? 'bg-slate-900/90 border border-slate-700 cursor-wait' 
            : 'bg-slate-950 border border-slate-800 hover:bg-slate-900 cursor-pointer'}
        `}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer z-10">
          {!isLoading ? (
            <>
              <div className="mb-4 p-3 bg-slate-900 rounded-full border border-slate-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
                 <UploadCloud className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Upload Resume</h3>
              <p className="text-slate-400 text-sm mb-4">Drag & drop or click to browse</p>
              
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-500 font-mono">PDF</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-500 font-mono">DOCX</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-500 font-mono">TXT</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="relative w-16 h-16">
                 <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/30 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                 <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <p className="mt-4 text-indigo-300 font-medium animate-pulse">Extracting Data...</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};