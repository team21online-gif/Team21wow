import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveUser, getUsers } from '../services/db';
import { UserRole, UserStatus } from '../types';
import { GraduationCap, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = login(username, password);
      if (user) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-600/20">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold">Team21 Login</h1>
          <p className="text-slate-400 mt-2">Welcome back, please sign in.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <LogIn size={20} />
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-700 pt-6">
          <p className="text-slate-400">Don't have an account?</p>
          <button onClick={() => navigate('/register')} className="text-blue-400 hover:text-blue-300 font-medium mt-1">
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: UserRole.STUDENT,
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    if (users.some(u => u.username === formData.username)) {
      setMessage('Username already exists.');
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      ...formData,
      status: UserStatus.PENDING, // Admins must approve
    };

    saveUser(newUser);
    setMessage('Registration successful! Waiting for admin approval.');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
         <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join Team21</h1>
          <p className="text-slate-400 mt-2">Create your account request.</p>
        </div>

        {message ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-300 mb-1">I am a...</label>
               <select
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
               >
                 <option value={UserRole.STUDENT}>Student</option>
                 <option value={UserRole.MENTOR}>Mentor</option>
               </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              <UserPlus size={20} />
              Submit Request
            </button>
          </form>
        )}
         <div className="mt-6 text-center border-t border-slate-700 pt-6">
          <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-white font-medium">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
