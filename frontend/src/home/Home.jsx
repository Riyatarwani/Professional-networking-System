import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './components/Sidebar';
import MessageContainer from './components/MessageContainer';
import Profile from '../profile/Profile';
import { FaUser, FaComments, FaUsers, FaBell, FaSearch } from 'react-icons/fa';

const Home = () => {
    const { authUser } = useAuth();
    const [activeTab, setActiveTab] = useState('messages');

    // Listen for profile switch event from sidebar
    React.useEffect(() => {
        const handleSwitchToProfile = () => {
            setActiveTab('profile');
        };

        window.addEventListener('switchToProfile', handleSwitchToProfile);
        return () => {
            window.removeEventListener('switchToProfile', handleSwitchToProfile);
        };
    }, []);

    // Ensure the user is logged in before rendering the home page
    if (!authUser) {
        return null;
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
            {/* Left Sidebar - Navigation */}
            <div className="w-20 bg-white shadow-lg flex flex-col items-center py-6 space-y-6">
                {/* Logo/Brand */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                </div>

                {/* Navigation Icons */}
                <button 
                    onClick={() => setActiveTab('messages')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                        activeTab === 'messages' 
                            ? 'bg-blue-100 text-blue-600 shadow-md' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <FaComments size={20} />
                </button>

                <button 
                    onClick={() => setActiveTab('network')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                        activeTab === 'network' 
                            ? 'bg-blue-100 text-blue-600 shadow-md' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <FaUsers size={20} />
                </button>

                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                        activeTab === 'profile' 
                            ? 'bg-blue-100 text-blue-600 shadow-md' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <FaUser size={20} />
                </button>

                <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                        activeTab === 'notifications' 
                            ? 'bg-blue-100 text-blue-600 shadow-md' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <FaBell size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex">
                {/* Sidebar - User List/Network */}
                <div className="w-80 bg-white shadow-lg">
                    <Sidebar activeTab={activeTab} />
                </div>

                {/* Main Content - Messages/Profile/Network */}
                <div className="flex-1 bg-white">
                    {activeTab === 'messages' && <MessageContainer />}
                    {activeTab === 'profile' && <Profile />}
                    {activeTab === 'network' && (
                        <div className="h-full bg-gradient-to-br from-green-50 to-emerald-100 overflow-y-auto">
                            <div className="max-w-6xl mx-auto p-8">
                                {/* Network Header */}
                                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Professional Network</h1>
                                            <p className="text-lg text-gray-600">Connect with professionals and grow your network</p>
                                        </div>
                                        <div className="flex space-x-4">
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                                Invite Contacts
                                            </button>
                                            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
                                                Import Contacts
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Network Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                                        <div className="text-gray-600">Total Connections</div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                                        <div className="text-gray-600">New This Week</div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                                        <div className="text-gray-600">Pending Requests</div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                        <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                                        <div className="text-gray-600">Mutual Connections</div>
                                    </div>
                                </div>

                                {/* Network Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Suggested Connections */}
                                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Connections</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        J
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">John Doe</h4>
                                                        <p className="text-sm text-gray-600">Software Engineer</p>
                                                        <p className="text-xs text-gray-500">5 mutual connections</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Connect
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        S
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">Sarah Smith</h4>
                                                        <p className="text-sm text-gray-600">Product Manager</p>
                                                        <p className="text-xs text-gray-500">3 mutual connections</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Network Insights */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Network Insights</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 mb-2">Growth Trend</h4>
                                                <p className="text-sm text-blue-600">Your network is growing steadily</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <h4 className="font-semibold text-green-800 mb-2">Top Industry</h4>
                                                <p className="text-sm text-green-600">Technology & Software</p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <h4 className="font-semibold text-purple-800 mb-2">Connection Quality</h4>
                                                <p className="text-sm text-purple-600">High engagement rate</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'notifications' && (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                                    <FaBell size={48} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Notifications</h2>
                                <p className="text-gray-600">Stay updated with your network...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;