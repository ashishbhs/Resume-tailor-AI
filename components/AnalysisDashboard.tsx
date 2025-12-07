import React, { useState } from 'react';
import { AnalysisResult, QualityMetric } from '../types';
import { CheckCircle, AlertCircle, Star, Edit, FileText, Sparkles } from './Icons';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onEditResume: () => void;
  onAutoFix: () => void;
  isOptimizing: boolean;
  analysisMode: 'jd' | 'general';
  isDarkMode: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onEditResume, onAutoFix, isOptimizing, analysisMode, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'keywords'>('suggestions');

  // SVG Chart Logic
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const score = Math.min(Math.max(result.atsScore, 0), 100); // Clamp score
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500'; 
    if (score >= 60) return 'text-yellow-500'; 
    return 'text-rose-500'; 
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 60) return '#eab308'; // yellow-500
    return '#f43f5e'; // rose-500
  };

  const isGeneral = analysisMode === 'general';

  // Helper to normalize score to 0-10
  const normalizeScore = (rawScore: number) => {
    if (rawScore > 10) return rawScore / 10; // Assume it was 0-100
    return rawScore;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-12">
      {/* Left Column: Score & Quality */}
      <div className="lg:col-span-1 space-y-6">
        {/* ATS Score Card */}
        <div className={`backdrop-blur-md p-6 rounded-2xl shadow-xl border flex flex-col items-center relative overflow-hidden transition-colors duration-300
          ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-slate-200'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h2 className={`text-lg font-semibold mb-6 tracking-wide ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {isGeneral ? "Resume Strength" : "ATS Match Score"}
          </h2>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} // slate-800 vs slate-200
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progress Circle - glowing */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getScoreStroke(score)}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${isDarkMode ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]'}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(score)} drop-shadow-md`}>
                {score}
              </span>
              <span className={`text-xs font-medium uppercase tracking-wide mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Out of 100</span>
            </div>
          </div>

          <p className={`text-center text-sm mt-4 px-4 font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {score >= 80 ? (isGeneral ? "Strong resume! Professional and impactful." : "Excellent match! Your resume is well-optimized.") : 
             score >= 60 ? (isGeneral ? "Solid foundation, but has room for improvement." : "Good foundation, but needs specific tailoring.") : 
             (isGeneral ? "Needs work on clarity, impact, or formatting." : "Significant gaps found for this role.")}
          </p>
        </div>

        {/* Quality Breakdown */}
        <div className={`backdrop-blur-md p-6 rounded-2xl shadow-xl border transition-colors duration-300
           ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-slate-200'}`}>
          <h3 className={`text-md font-semibold mb-5 flex items-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            <Star className="w-4 h-4 mr-2 text-indigo-400" /> Quality Metrics
          </h3>
          <div className="space-y-6">
            {(Object.entries(result.quality) as [string, QualityMetric][]).map(([key, metric]) => {
              const normalizedScore = normalizeScore(metric.score);
              const barWidth = Math.min(normalizedScore * 10, 100);
              
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium capitalize tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{key}</span>
                    <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{normalizedScore}/10</span>
                  </div>
                  <div className={`w-full rounded-full h-1.5 mb-3 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${isDarkMode ? 'shadow-[0_0_10px_rgba(255,255,255,0.2)]' : ''}`} 
                      style={{ width: `${barWidth}%`, backgroundColor: normalizedScore > 7 ? '#10b981' : normalizedScore > 4 ? '#eab308' : '#f43f5e' }}
                    ></div>
                  </div>
                  <p className={`text-xs p-2.5 rounded border leading-relaxed italic
                    ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    "{metric.feedback}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Summary & Detailed Recommendations */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        
        {/* Executive Summary */}
        <div className={`backdrop-blur-md p-6 rounded-2xl shadow-xl border transition-colors duration-300
           ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg mr-3 border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Executive Summary</h3>
          </div>
          <p className={`leading-relaxed text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {result.summary}
          </p>
        </div>

        {/* Actions Bar - Auto Fix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={onAutoFix}
            disabled={isOptimizing}
            className={`group relative flex items-center justify-center p-4 rounded-xl transition-all shadow-lg overflow-hidden
              ${isOptimizing 
                ? 'bg-slate-800 cursor-not-allowed opacity-75' 
                : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'}`}
          >
            {/* Button Gradient overlay */}
            {!isOptimizing && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100 transition-opacity"></div>}
            
            <div className="relative flex items-center z-10 text-white">
              {isOptimizing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-3 animate-spin text-indigo-300" />
                  <span className="text-indigo-200">Processing...</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-white/10 rounded-lg mr-3 group-hover:bg-white/20 transition-colors">
                     <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold tracking-tight">Auto-Optimize</div>
                    <div className="text-xs text-indigo-100 font-normal opacity-80">Apply AI Enhancements</div>
                  </div>
                </>
              )}
            </div>
          </button>
          
          <button 
            onClick={onEditResume}
            className={`group flex items-center justify-center p-4 border rounded-xl font-semibold transition-all shadow-lg
              ${isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'}`}
          >
            <div className={`p-1.5 rounded-lg mr-3 transition-colors ${isDarkMode ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
               <Edit className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            </div>
            <span>Open Live Editor</span>
          </button>
        </div>

        {/* Tabs Container */}
        <div className={`backdrop-blur-md rounded-2xl shadow-xl border overflow-hidden flex flex-col h-[600px] transition-colors duration-300
           ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-slate-200'}`}>
          <div className={`border-b overflow-x-auto shrink-0 ${isDarkMode ? 'border-slate-700/50 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
            <nav className="flex space-x-8 px-6 min-w-max" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-indigo-500 text-indigo-500'
                    : `border-transparent hover:border-slate-300 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`
                }`}
              >
                {isGeneral ? "Improvements" : "Tailoring Suggestions"}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-semibold ${
                  activeTab === 'suggestions' 
                  ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600') 
                  : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600')
                }`}>
                  {result.suggestions.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'keywords'
                    ? 'border-indigo-500 text-indigo-500'
                    : `border-transparent hover:border-slate-300 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`
                }`}
              >
                {isGeneral ? "Missing Elements" : "Missing Keywords"}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-semibold ${
                  activeTab === 'keywords' 
                  ? (isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-600') 
                  : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600')
                }`}>
                  {result.missingKeywords.length}
                </span>
              </button>
            </nav>
          </div>

          <div className="p-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {result.suggestions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                     <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/50 mb-3" />
                     <p>No suggestions found! Your resume looks great.</p>
                  </div>
                ) : (
                  result.suggestions.map((suggestion) => (
                    <div key={suggestion.id} className={`border rounded-xl p-5 hover:border-indigo-500/50 transition-colors shadow-sm group
                       ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize tracking-wide border
                          ${suggestion.impact === 'high' 
                            ? (isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200') : 
                            suggestion.impact === 'medium' 
                            ? (isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200') : 
                            (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}`}>
                          {suggestion.impact} Impact • {suggestion.type}
                        </span>
                      </div>
                      
                      {suggestion.originalText && (
                        <div className="mb-4">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                            Original
                          </h5>
                          <div className={`p-4 rounded-lg text-sm border-l-2 italic
                            ${isDarkMode ? 'text-slate-400 bg-slate-900/50 border-slate-600' : 'text-slate-600 bg-slate-50 border-slate-300'}`}>
                            "{suggestion.originalText}"
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
                          Suggested Change
                        </h5>
                        <div className={`p-4 rounded-lg text-sm border-l-2 border-indigo-500 font-medium
                          ${isDarkMode ? 'text-slate-200 bg-indigo-500/10' : 'text-slate-800 bg-indigo-50'}`}>
                          "{suggestion.suggestedText}"
                        </div>
                      </div>

                      <div className={`mt-4 flex items-start text-sm pt-2 border-t
                        ${isDarkMode ? 'text-slate-500 border-slate-700/50' : 'text-slate-500 border-slate-100'}`}>
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-indigo-400 flex-shrink-0" />
                        <span>{suggestion.reason}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'keywords' && (
              <div>
                <p className={`text-sm mb-6 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isGeneral 
                    ? "The following elements or specific skills appear to be missing or underrepresented. Consider adding these to enhance your professional presentation." 
                    : "The following keywords appear frequently in the job description but are missing from your resume. Try to incorporate these naturally."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {result.missingKeywords.length === 0 ? (
                     <span className="text-slate-500 italic">No missing keywords detected.</span>
                  ) : (
                    result.missingKeywords.map((keyword, idx) => (
                      <span key={idx} className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border shadow-sm transition-colors cursor-default
                         ${isDarkMode 
                           ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20' 
                           : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {keyword}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};