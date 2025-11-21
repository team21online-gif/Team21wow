import React, { useState, useEffect } from 'react';
import { getCurrentUser, getCourses, getSubmissions, getUsers, saveSubmission } from '../../services/db';
import { Course, Submission, User, Submission as ISubmission } from '../../types';
import { CheckSquare, MessageSquare, Clock } from 'lucide-react';

export const MentorDashboard: React.FC = () => {
  const currentUser = getCurrentUser();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ISubmission | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const allCourses = getCourses();
    // Filter courses where this mentor is assigned
    const relevantCourses = allCourses.filter(c => c.assignedMentorIds.includes(currentUser.id));
    setMyCourses(relevantCourses);

    const allSubmissions = getSubmissions();
    // Filter submissions for relevant courses
    const relevantSubmissions = allSubmissions.filter(s => 
        relevantCourses.some(c => c.id === s.courseId)
    );
    setSubmissions(relevantSubmissions);
    setUsers(getUsers());
  }, [currentUser]);

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const updated = {
      ...selectedSubmission,
      grade,
      feedback,
      gradedAt: new Date().toISOString()
    };
    
    saveSubmission(updated);
    setSubmissions(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedSubmission(null);
  };

  const pendingSubmissions = submissions.filter(s => !s.gradedAt);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="text-blue-500" /> Pending Grading
              </h2>
              {pendingSubmissions.length === 0 ? (
                  <p className="text-slate-500 italic">No work pending review. Great job!</p>
              ) : (
                  <div className="space-y-3">
                      {pendingSubmissions.map(sub => {
                          const student = users.find(u => u.id === sub.studentId);
                          const course = myCourses.find(c => c.id === sub.courseId);
                          const lesson = course?.lessons.find(l => l.id === sub.lessonId);
                          
                          return (
                              <div key={sub.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center">
                                  <div>
                                      <p className="font-bold text-slate-800">{student?.fullName}</p>
                                      <p className="text-sm text-slate-500">{course?.title} - {lesson?.title}</p>
                                      <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                  </div>
                                  <button 
                                    onClick={() => { setSelectedSubmission(sub); setGrade(0); setFeedback(''); }}
                                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200"
                                  >
                                      Grade
                                  </button>
                              </div>
                          )
                      })}
                  </div>
              )}
          </div>
          
           {/* Assigned Students List (Simplified) */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">My Students</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                   {users.filter(u => myCourses.some(c => c.assignedStudentIds.includes(u.id))).map(student => (
                       <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                           <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
                               {student.fullName.charAt(0)}
                           </div>
                           <div>
                               <p className="font-medium text-slate-800">{student.fullName}</p>
                               <p className="text-xs text-slate-500">@{student.username}</p>
                           </div>
                       </div>
                   ))}
              </div>
           </div>
       </div>

       {/* Grading Panel */}
       <div className="lg:col-span-1">
           {selectedSubmission ? (
               <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 sticky top-6">
                   <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-100 pb-2">Grading</h3>
                   
                   <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-2">Submission Content</p>
                       <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedSubmission.content}</p>
                   </div>

                   <form onSubmit={handleGradeSubmit} className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Score (0-100)</label>
                           <input 
                               type="number" 
                               min="0" 
                               max="100" 
                               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                               value={grade}
                               onChange={e => setGrade(Number(e.target.value))}
                               required
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Feedback</label>
                           <textarea 
                               className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                               value={feedback}
                               onChange={e => setFeedback(e.target.value)}
                               placeholder="Constructive feedback..."
                               required
                           ></textarea>
                       </div>
                       <div className="flex gap-2">
                           <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                               <CheckSquare size={18} /> Submit Grade
                           </button>
                           <button type="button" onClick={() => setSelectedSubmission(null)} className="px-4 py-2 bg-gray-100 text-slate-600 rounded-lg font-medium hover:bg-gray-200">
                               Cancel
                           </button>
                       </div>
                   </form>
               </div>
           ) : (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 h-full flex flex-col items-center justify-center min-h-[300px]">
                   <MessageSquare size={48} className="mb-4 opacity-50" />
                   <p>Select a submission to start grading.</p>
               </div>
           )}
       </div>
    </div>
  );
};
