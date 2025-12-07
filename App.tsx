import React, { useState, useRef, useEffect } from 'react';
import { extractTextFromResume, analyzeResume, autoOptimizeResume } from './services/geminiService';
import { AppState, AnalysisResult } from './types';
import { ResumeUploader } from './components/ResumeUploader';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { LoginScreen } from './components/LoginScreen';
import { FileText, ArrowRight, RefreshCw, CheckCircle, UploadCloud, X, Sparkles, AlertCircle } from './components/Icons';

// Styled Components for Step Indicator
const StepIndicator = ({ step, current, label }: { step: number, current: number, label: string }) => {
  const isActive = step === current;
  const isCompleted = step < current;
  
  return (
    <div className={`flex items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300
      ${isActive 
        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
        : isCompleted 
          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
          : 'bg-slate-800/30 border-slate-700 text-slate-500'}`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3
        ${isActive ? 'bg-indigo-500 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
        {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : step}
      </div>
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jdText, setJdText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'jd' | 'general'>('jd');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [editedResumeText, setEditedResumeText] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    setAppState(AppState.PARSING);
    setErrorMsg(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = error => reject(error);
      });

      const text = await extractTextFromResume(base64, file.type);
      setResumeText(text);
      setEditedResumeText(text);
      setAppState(AppState.READY);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not parse the file. Please try a different format or paste the text.");
      setAppState(AppState.IDLE);
    }
  };

  const handleAnalyze = async (mode: 'jd' | 'general') => {
    if (!resumeText) return;
    if (mode === 'jd' && !jdText.trim()) return;

    setAnalysisMode(mode);
    setAppState(AppState.ANALYZING);
    
    try {
      const textToAnalyze = appState === AppState.RESULTS ? editedResumeText : resumeText;
      const jdToUse = mode === 'jd' ? jdText : "";
      
      const result = await analyzeResume(textToAnalyze, jdToUse);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Analysis failed. Please try again later.");
      setAppState(AppState.READY);
    }
  };

  const handleReAnalyze = async () => {
    setAppState(AppState.ANALYZING);
    try {
      const jdToUse = analysisMode === 'jd' ? jdText : "";
      const result = await analyzeResume(editedResumeText, jdToUse);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
      setIsEditorOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Re-analysis failed.");
      setAppState(AppState.RESULTS);
    }
  };

  const handleAutoOptimize = async () => {
    if (!analysisResult) return;
    setIsOptimizing(true);
    try {
      const jdToUse = analysisMode === 'jd' ? jdText : "";
      const improvedText = await autoOptimizeResume(editedResumeText, jdToUse, analysisResult.suggestions);
      setEditedResumeText(improvedText);
      setIsOptimizing(false);
      setIsEditorOpen(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Auto-optimization failed. Please try manual editing.");
      setIsOptimizing(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResumeFile(null);
    setResumeText("");
    setJdText("");
    setAnalysisResult(null);
    setErrorMsg(null);
    setAnalysisMode('jd');
    setEditedResumeText("");
    setIsEditorOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        </div>
        
        <main className="relative z-10">
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer group" onClick={resetApp}>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg mr-3 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ResumeTailor AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {appState !== AppState.IDLE && (
              <button 
                onClick={resetApp}
                className="hidden sm:block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
              >
                Start New Analysis
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-slate-800 shadow-lg cursor-pointer" title="Logged in as User"></div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Progress Stepper */}
        {appState !== AppState.RESULTS && (
          <div className="flex justify-center mb-16 gap-3 sm:gap-6 flex-wrap">
            <StepIndicator step={1} current={appState === AppState.IDLE || appState === AppState.PARSING ? 1 : 2} label="Upload" />
            <div className="w-8 h-px bg-slate-800 self-center hidden sm:block"></div>
            <StepIndicator step={2} current={appState === AppState.READY || appState === AppState.ANALYZING ? 2 : 1} label="Context" />
            <div className="w-8 h-px bg-slate-800 self-center hidden sm:block"></div>
            <StepIndicator step={3} current={0} label="Results" />
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-300 px-6 py-4 rounded-xl mb-8 flex items-center backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium mr-2">Error:</span> {errorMsg}
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-sm hover:text-white transition-colors">Dismiss</button>
          </div>
        )}

        {/* View: Initial Upload */}
        {(appState === AppState.IDLE || appState === AppState.PARSING) && (
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Optimize your resume with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligent AI</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your resume and let our advanced model analyze it against job descriptions to increase your ATS score and interview chances.
            </p>
            
            <ResumeUploader 
              onFileUpload={handleFileUpload} 
              isLoading={appState === AppState.PARSING}
            />
          </div>
        )}

        {/* View: Job Description Input */}
        {appState === AppState.READY && (
          <div className="max-w-5xl mx-auto animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                {/* Parsed Resume Column */}
                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-200 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                      Parsed Resume
                    </h3>
                    <div className="flex items-center space-x-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       <span className="text-xs text-emerald-400 font-medium">Extracted</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-slate-950/30 text-xs font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {resumeText}
                  </div>
                </div>

                {/* Job Description Column */}
                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-indigo-500/20 flex flex-col shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Target Job Description</h3>
                    <textarea
                      className="flex-1 w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600 mb-6"
                      placeholder="Paste the job description (JD) here..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAnalyze('jd')}
                        disabled={!jdText.trim()}
                        className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5
                          ${!jdText.trim() 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-500/50'}`}
                      >
                        Match & Tailor to JD
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>

                      <div className="text-center">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold px-2">OR</span>
                      </div>

                      <button
                        onClick={() => handleAnalyze('general')}
                        className="w-full py-3 px-4 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition-colors"
                      >
                        Skip JD (General Audit)
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* View: Analyzing Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="relative inline-flex mb-8">
               <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
               <div className="relative bg-slate-900 p-6 rounded-full border border-slate-800">
                 <UploadCloud className="w-12 h-12 text-indigo-400 animate-bounce" />
               </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              {analysisMode === 'jd' ? "Analyzing Compatibility..." : "Auditing Resume Structure..."}
            </h2>
            <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-[loading_1.5s_ease-in-out_infinite] w-1/2"></div>
            </div>
            <p className="text-slate-400 max-w-md mx-auto">
              {analysisMode === 'jd' 
                ? "Comparing skills, experience, and keywords against the provided job description."
                : "Checking against industry best practices for impact, clarity, and formatting."}
            </p>
          </div>
        )}

        {/* View: Results Dashboard */}
        {appState === AppState.RESULTS && analysisResult && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Analysis Results</h2>
              <p className="text-slate-400">
                {analysisMode === 'jd' ? "Optimization suggestions based on target JD." : "General best-practice audit."}
              </p>
            </div>

            <AnalysisDashboard 
              result={analysisResult} 
              analysisMode={analysisMode}
              onEditResume={() => setIsEditorOpen(true)}
              onAutoFix={handleAutoOptimize}
              isOptimizing={isOptimizing}
            />
          </div>
        )}
      </main>

      {/* Full Screen Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <FileText className="w-5 h-5 mr-3 text-indigo-400" />
                Live Resume Editor
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReAnalyze}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze New Version
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col relative bg-slate-950">
              <div className="absolute inset-0 p-6 overflow-hidden">
                <div className="h-full bg-slate-900 rounded-xl border border-slate-700 flex flex-col shadow-inner">
                  <textarea
                    value={editedResumeText}
                    onChange={(e) => setEditedResumeText(e.target.value)}
                    className="flex-1 w-full p-8 text-sm font-mono text-slate-300 bg-transparent leading-relaxed focus:outline-none resize-none selection:bg-indigo-500/30 selection:text-white"
                    spellCheck="false"
                    placeholder="Edit your resume content here..."
                  />
                  <div className="px-4 py-2 bg-slate-900 text-xs text-slate-500 border-t border-slate-700 flex justify-between rounded-b-xl">
                    <span>Markdown supported</span>
                    <span>{editedResumeText.length} characters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;