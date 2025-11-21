import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, getCourses, saveSubmission, getSubmissions } from '../../services/db';
import { Course, Lesson } from '../../types';
import { getTutorResponse } from '../../services/gemini';
import { Bot, Send, CheckCircle, ChevronLeft, FileText } from 'lucide-react';

export const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = getCourses().find(c => c.id === id);
    if (c) {
        setCourse(c);
        setActiveLesson(c.lessons[0] || null);
    }
  }, [id]);

  useEffect(() => {
      if (activeLesson && user && course) {
          const subs = getSubmissions();
          const existing = subs.find(s => s.studentId === user.id && s.lessonId === activeLesson.id);
          setPreviousSubmission(existing || null);
          setSubmissionContent(existing ? existing.content : '');
          setChatHistory([{role: 'model', text: `Hi! I'm your AI Tutor. I can help you understand "${activeLesson.title}". Ask me anything about this lesson!`}]);
      }
  }, [activeLesson, user, course]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmitWork = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !course || !activeLesson) return;

      saveSubmission({
          id: previousSubmission?.id || crypto.randomUUID(),
          studentId: user.id,
          courseId: course.id,
          lessonId: activeLesson.id,
          content: submissionContent,
          submittedAt: new Date().toISOString(),
          grade: undefined,
          feedback: undefined
      });
      // Refresh locally
      setPreviousSubmission({ ...previousSubmission, content: submissionContent, submittedAt: new Date().toISOString() });
      alert("Work submitted successfully!");
  };

  const handleChat = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeLesson) return;

      const userMsg = chatInput;
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatInput('');
      setIsChatLoading(true);

      const response = await getTutorResponse(chatHistory, userMsg, activeLesson.content);
      setChatHistory(prev => [...prev, { role: 'model', text: response || "I couldn't generate a response." }]);
      setIsChatLoading(false);
  };

  if (!course || !activeLesson) return <div>Loading...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="font-bold text-slate-800">{course.title}</h2>
                    <p className="text-xs text-slate-500">{activeLesson.title}</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8 prose max-w-none">
                <h1>{activeLesson.title}</h1>
                <div className="markdown-body text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {activeLesson.content}
                </div>
                
                {/* Submission Area */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="text-blue-500" /> Your Submission
                    </h3>
                    {previousSubmission?.grade ? (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                            <p className="font-bold text-green-800 text-lg">Grade: {previousSubmission.grade}/100</p>
                            <p className="text-green-700 mt-1">Feedback: {previousSubmission.feedback}</p>
                        </div>
                    ) : null}
                    
                    <form onSubmit={handleSubmitWork}>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-4 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Type your answer or assignment details here..."
                            value={submissionContent}
                            onChange={e => setSubmissionContent(e.target.value)}
                            disabled={!!previousSubmission?.grade}
                        ></textarea>
                        <button 
                            type="submit" 
                            disabled={!!previousSubmission?.grade}
                            className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {previousSubmission ? 'Update Submission' : 'Submit Assignment'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Lesson Navigation Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 overflow-x-auto">
                {course.lessons.map((lesson, idx) => (
                    <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            activeLesson.id === lesson.id 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-100'
                        }`}
                    >
                        Lesson {idx + 1}
                    </button>
                ))}
            </div>
        </div>

        {/* Sidebar: AI Tutor */}
        <div className="w-full lg:w-80 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center gap-2 shadow-sm">
                <Bot size={20} />
                <span className="font-bold">AI Study Tutor</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-slate-700 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChat} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input 
                    className="flex-1 bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ask about this lesson..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                />
                <button 
                    type="submit" 
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    </div>
  );
};
