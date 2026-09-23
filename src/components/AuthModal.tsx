import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, UserPlus, Github, Chrome as Google } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        uid: user.uid,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        photoURL: user.photoURL || '',
        isAdmin: user.email === 'kofiobeng2006@gmail.com'
      };
      
      onLogin(userData);
      onClose();
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled. Please try again.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // This is safe to ignore or just silent
      } else {
        setError("An unexpected error occurred during sign-in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, keep mock login as fallback but warn user
    console.warn("Using mock login. Firestore operations will fail unless real Auth is used.");
    const userEmail = formData.email;
    const mockUser = {
      uid: 'u123',
      email: userEmail,
      firstName: formData.firstName || 'Customer',
      lastName: formData.lastName || '',
      phone: '020 179 2171',
      isAdmin: userEmail === 'kofiobeng2006@gmail.com',
      savedAddresses: []
    };
    onLogin(mockUser);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-white dark:bg-[#1e293b] rounded-[32px] shadow-2xl z-[201] overflow-hidden transition-colors duration-300"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img 
                    src="/assets/logo.png" 
                    alt="3ripple Logo" 
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-slate-400 dark:text-slate-500" />
                </button>
              </div>

              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {isLogin ? 'Welcome back' : 'Join the Family'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                {isLogin ? 'Enter your credentials to access your secure workspace.' : 'Start your journey towards healthier mornings today.'}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 dark:text-slate-100"
                        placeholder="John"
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 dark:text-slate-100"
                        placeholder="Doe"
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm dark:text-slate-100"
                      placeholder="alex.smith@example.com"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                    {isLogin && <button type="button" className="text-xs font-bold text-[var(--color-brand-blue)]">Forgot?</button>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input 
                      type="password" 
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm dark:text-slate-100"
                      placeholder="••••••••"
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary !py-4 mt-4 shadow-xl shadow-blue-100 dark:shadow-none">
                  {isLogin ? (
                    <span className="flex items-center justify-center gap-2">Sign In <LogIn size={18} /></span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">Create Account <UserPlus size={18} /></span>
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-xs text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">Or continue with</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50 dark:text-slate-300"
                >
                  <Google size={18} className="text-red-500" /> 
                  {loading ? 'Connecting...' : 'Google'}
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium dark:text-slate-300">
                  <Github size={18} className="text-slate-800 dark:text-slate-100" /> GitHub
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-[var(--color-brand-blue)] font-bold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
