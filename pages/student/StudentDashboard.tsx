import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getCourses } from '../../services/db';
import { Course } from '../../types';
import { PlayCircle, Book, ChevronRight } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const allCourses = getCourses();
      setCourses(allCourses.filter(c => c.assignedStudentIds.includes(user.id)));
    }
  }, [user]);

  return (
    <div>
       <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">My Learning</h1>
            <p className="text-slate-500">Continue where you left off.</p>
        </header>

        {courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <Book size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">No courses assigned yet</h3>
                <p className="text-slate-500 mt-1">Contact your administrator to get enrolled.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-slate-800 p-6 relative">
                             <h3 className="text-white font-bold text-xl relative z-10">{course.title}</h3>
                             <div className="absolute bottom-0 right-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                                 <Book size={120} />
                             </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">{course.description}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <span className="text-xs font-bold text-slate-400 uppercase">{course.lessons.length} Lessons</span>
                                <button 
                                    onClick={() => navigate(`/course/${course.id}`)}
                                    className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                                >
                                    Start Learning <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
