import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                                Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-700 font-medium">
                                Online Exam Platform
                            </p>
                        </div>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Test your abilities with our comprehensive exam system. 
                            Take exams, track your progress, and excel in your studies.
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
                                <div className="text-3xl mb-2">📚</div>
                                <div className="text-2xl font-bold text-blue-600">Multiple Exams</div>
                                <div className="text-gray-600 text-sm mt-1">Various subjects available</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
                                <div className="text-3xl mb-2">⚡</div>
                                <div className="text-2xl font-bold text-green-600">Instant Results</div>
                                <div className="text-gray-600 text-sm mt-1">MCQ results immediately</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
                                <div className="text-3xl mb-2">📊</div>
                                <div className="text-2xl font-bold text-purple-600">Track Progress</div>
                                <div className="text-gray-600 text-sm mt-1">View all your results</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Cards */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Get Started
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choose an action to begin your exam journey
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                    {/* Take Exam Card */}
                    <Link 
                        to="/exam-selection" 
                        className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-8 md:p-12 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:rotate-12 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4">Take Exam</h3>
                            <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                                Select from available exams and test your knowledge. 
                                MCQ, Theory, and Coding questions await you.
                            </p>
                            <div className="flex items-center text-white/90 font-semibold">
                                <span>Start Exam</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>

                    {/* View Results Card */}
                    <Link 
                        to="/results" 
                        className="group relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-8 md:p-12 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:rotate-12 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4">View Results</h3>
                            <p className="text-green-100 text-lg mb-6 leading-relaxed">
                                Check your previous exam submissions, scores, and detailed performance analysis.
                            </p>
                            <div className="flex items-center text-white/90 font-semibold">
                                <span>View Results</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                </div>

                {/* Features Section */}
                <div className="max-w-6xl mx-auto mt-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Platform Features
                        </h2>
                        <p className="text-lg text-gray-600">
                            Everything you need for a seamless exam experience
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Multiple Question Types</h3>
                            <p className="text-gray-600 text-sm">MCQ, Theory, and Coding questions in one platform</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Timer & Auto-Submit</h3>
                            <p className="text-gray-600 text-sm">Real-time timer with automatic submission</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Instant MCQ Results</h3>
                            <p className="text-gray-600 text-sm">Get immediate feedback on MCQ questions</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Progress Tracking</h3>
                            <p className="text-gray-600 text-sm">Monitor your performance over time</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="max-w-4xl mx-auto mt-20 mb-12">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start?</h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            Select an exam and begin your journey to success
                        </p>
                        <Link
                            to="/exam-selection"
                            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                        >
                            Browse Available Exams
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
