import React, { useState, useEffect } from 'react';
import { getUsers, saveUser, getCourses, saveCourse } from '../../services/db';
import { User, UserStatus, Course, UserRole } from '../../types';
import { generateCourseOutline } from '../../services/gemini';
import { CheckCircle, XCircle, UserCheck, BookOpen, Plus, Loader2, Sparkles } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<'users' | 'courses'>('users');

  useEffect(() => {
    setUsers(getUsers());
    setCourses(getCourses());
  }, []);

  const handleStatusChange = (user: User, status: UserStatus) => {
    const updated = { ...user, status };
    saveUser(updated);
    setUsers(getUsers());
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500">Manage users, approvals, and curriculum.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button 
                onClick={() => setView('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'users' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-gray-50'}`}
            >
                User Management
            </button>
            <button 
                onClick={() => setView('courses')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'courses' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-gray-50'}`}
            >
                Course Management
            </button>
        </div>
      </header>

      {view === 'users' ? (
        <UserManagement users={users} onStatusChange={handleStatusChange} />
      ) : (
        <CourseManagement courses={courses} onCourseAdd={() => setCourses(getCourses())} users={users} />
      )}
    </div>
  );
};

const UserManagement: React.FC<{ users: User[]; onStatusChange: (u: User, s: UserStatus) => void }> = ({ users, onStatusChange }) => {
  const pending = users.filter(u => u.status === UserStatus.PENDING);
  const active = users.filter(u => u.status === UserStatus.ACTIVE);

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2 mb-4">
            <UserCheck size={20} /> Pending Approvals
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pending.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800">{user.fullName}</p>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">{user.role}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => onStatusChange(user, UserStatus.ACTIVE)} className="flex-1 bg-green-600 text-white py-2 rounded-md text-sm hover:bg-green-700 transition-colors">Approve</button>
                  <button onClick={() => onStatusChange(user, UserStatus.REJECTED)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-md text-sm hover:bg-red-200 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-slate-700">All Active Users</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-slate-500">
                <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Mentor</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {active.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                            {user.fullName}
                            <div className="text-slate-500 font-normal text-xs">@{user.username}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                                user.role === UserRole.MENTOR ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                            {user.role === UserRole.STUDENT ? (
                                user.mentorId ? (users.find(u => u.id === user.mentorId)?.fullName || 'Unknown') : 
                                <span className="text-amber-500 text-xs italic">Unassigned</span>
                            ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => onStatusChange(user, UserStatus.REJECTED)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                                Deactivate
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

const CourseManagement: React.FC<{ courses: Course[]; onCourseAdd: () => void; users: User[] }> = ({ courses, onCourseAdd, users }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mentors = users.filter(u => u.role === UserRole.MENTOR && u.status === UserStatus.ACTIVE);
  const students = users.filter(u => u.role === UserRole.STUDENT && u.status === UserStatus.ACTIVE);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const courseData = await generateCourseOutline(topic);
      if (courseData) {
        const newCourse: Course = {
          id: crypto.randomUUID(),
          title: courseData.title,
          description: courseData.description,
          lessons: courseData.lessons.map((l: any) => ({ ...l, id: crypto.randomUUID() })),
          assignedStudentIds: [],
          assignedMentorIds: []
        };
        saveCourse(newCourse);
        onCourseAdd();
        setIsCreating(false);
        setTopic('');
      }
    } catch (e) {
      alert("Failed to generate course. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified assignment handler for demo
  const handleAssign = (courseId: string, userId: string, type: 'student' | 'mentor') => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      if (type === 'student') {
          if (course.assignedStudentIds.includes(userId)) return;
          course.assignedStudentIds.push(userId);
      } else {
          if (course.assignedMentorIds.includes(userId)) return;
          course.assignedMentorIds.push(userId);
      }
      saveCourse(course);
      onCourseAdd(); // Refresh
  };

  return (
    <div className="space-y-6">
      {!isCreating ? (
        <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 font-medium"
        >
            <Plus size={20} /> Create New Course
        </button>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="text-accent" /> AI Course Creator
            </h3>
            <p className="text-slate-500 mb-4">Enter a topic and our AI will generate a complete course structure with lessons.</p>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Introduction to React Hooks, Advanced Python Data Science..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !topic}
                    className="bg-accent hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                    Generate
                </button>
                <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:bg-slate-100 px-4 rounded-lg">Cancel</button>
            </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800">{course.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
            </div>
            
            <div className="mt-auto space-y-4">
                <div className="text-sm">
                    <span className="font-semibold text-slate-700">Lessons:</span> {course.lessons.length}
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Quick Assign</label>
                    <div className="flex gap-2">
                         <select 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded text-xs p-2 outline-none"
                            onChange={(e) => { if(e.target.value) handleAssign(course.id, e.target.value, 'mentor'); e.target.value=''; }}
                         >
                             <option value="">+ Add Mentor</option>
                             {mentors.filter(m => !course.assignedMentorIds.includes(m.id)).map(m => (
                                 <option key={m.id} value={m.id}>{m.fullName}</option>
                             ))}
                         </select>
                         <select 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded text-xs p-2 outline-none"
                            onChange={(e) => { if(e.target.value) handleAssign(course.id, e.target.value, 'student'); e.target.value=''; }}
                         >
                             <option value="">+ Add Student</option>
                             {students.filter(s => !course.assignedStudentIds.includes(s.id)).map(s => (
                                 <option key={s.id} value={s.id}>{s.fullName}</option>
                             ))}
                         </select>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {course.assignedMentorIds.map(id => {
                            const m = users.find(u => u.id === id);
                            return m ? <span key={id} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">{m.fullName} (M)</span> : null
                        })}
                        {course.assignedStudentIds.map(id => {
                            const s = users.find(u => u.id === id);
                            return s ? <span key={id} className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100">{s.fullName} (S)</span> : null
                        })}
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
