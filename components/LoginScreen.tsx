import React, { useState } from 'react';
import { FileText, GoogleIcon, Sparkles } from './Icons';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin();
      setIsLoggingIn(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="relative group w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-500/30">
            <FileText className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ResumeTailor AI</span>
          </h1>
          
          <p className="text-slate-400 mb-10 leading-relaxed text-sm sm:text-base">
            Optimize your resume for any job description in seconds using advanced AI.
          </p>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white text-slate-900 hover:bg-slate-50 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg group-hover:shadow-white/10"
          >
            {isLoggingIn ? (
              <>
                 <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
                 <span className="text-slate-600">Signing in...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <p className="mt-8 text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};