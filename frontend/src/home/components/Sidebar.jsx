import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCircle, FaComments } from 'react-icons/fa';
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from "react-icons/bi";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userConversation from '../../Zustans/useConversation';

const Sidebar = ({ activeTab }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatUsersLoading, setChatUsersLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('chats');
    const [chatUser, setChatUser] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageUsers, setNewMessageUsers] = useState('');
    const [isOnline, setIsOnline] = useState([]);
    const [apiAvailable, setApiAvailable] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [networkLoading, setNetworkLoading] = useState(false);
    
    // Get the state and functions from Zustand store
    const { setSelectedConversation } = userConversation();

    // Fetch all users for networking
    useEffect(() => {
        const fetchAllUsers = async () => {
            if (activeTab !== 'network') return;
            
            setNetworkLoading(true);
            try {
                const response = await axios.get('/api/users/all', {
                    withCredentials: true
                });
                const data = response.data;
                
                if (data.success === false) {
                    console.log(data.message);
                    toast.error(data.message || "Failed to load users");
                    setAllUsers([]);
                } else if (Array.isArray(data)) {
                    // Filter out current user
                    const filteredUsers = data.filter(user => user._id !== authUser._id);
                    setAllUsers(filteredUsers);
                } else {
                    console.error("Expected array but received:", typeof data, data);
                    setAllUsers([]);
                }
            } catch (error) {
                console.error("Error fetching all users:", error);
                if (error.response && error.response.status === 404) {
                    // Fallback to search endpoint if all users endpoint doesn't exist
                    try {
                        const searchResponse = await axios.get('/api/user/search?search=', {
                            withCredentials: true
                        });
                        const searchData = searchResponse.data;
                        if (Array.isArray(searchData)) {
                            const filteredUsers = searchData.filter(user => user._id !== authUser._id);
                            setAllUsers(filteredUsers);
                        }
                    } catch (searchError) {
                        console.error("Fallback search also failed:", searchError);
                        setAllUsers([]);
                    }
                } else {
                    setAllUsers([]);
                }
            } finally {
                setNetworkLoading(false);
            }
        };

        if (authUser && activeTab === 'network') {
            fetchAllUsers();
        }
    }, [authUser, activeTab]);

    // Fetch current chatters
    useEffect(() => {
        const fetchChatUsers = async () => {
            setChatUsersLoading(true);
            try {
                // Using the correct endpoint path
                const response = await axios.get('/api/users/currentchatters', {
                    withCredentials: true
                });
                const data = response.data;
                
                // Ensure data is an array before setting state
                if (data.success === false) {
                    console.log(data.message);
                    toast.error(data.message || "Failed to load chats");
                    setChatUser([]); // Set empty array to prevent mapping errors
                } else if (Array.isArray(data)) {
                    setChatUser(data);
                    // Initialize online status array
                    setIsOnline(new Array(data.length).fill(false));
                } else {
                    console.error("Expected array but received:", typeof data, data);
                    toast.error("Received invalid data format from server");
                    setChatUser([]); // Set empty array to prevent mapping errors
                }
            } catch (error) {
                console.error("Error fetching current chatters:", error);
                // Handle 404 error specifically
                if (error.response && error.response.status === 404) {
                    toast.error("Chat service endpoint not found");
                } else if (error.response && error.response.status === 401) {
                    toast.error("Please login again");
                } else {
                    toast.error("Failed to load chats. Please check your connection.");
                }
                // Set empty array to prevent errors
                setChatUser([]);
            } finally {
                setChatUsersLoading(false);
            }
        };
        
        if (authUser) {
            fetchChatUsers();
        }
    }, [authUser]);

    // Handle search submission
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        
        if (!searchInput.trim()) {
            toast.info("Please enter a search term");
            return;
        }
        
        setLoading(true);
        try {
            const search = await axios.get(`/api/user/search?search=${searchInput}`);
            const data = search.data;
            
            if (data.success === false) {
                console.log(data.message);
                toast.error(data.message || "Search failed");
            } else {
                if (data.length === 0) {
                    toast.info("User Not Found");
                } else {
                    setSearchUser(data);
                    setActiveSection('search-results');
                }
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("An error occurred while searching");
        } finally {
            setLoading(false);
        }
    };

    // Handle user selection - Fixed function name and implementation
    const handleUserClick = (user) => {
        setSelectedConversation(user);
        setSelectedUserId(user._id);
        setNewMessageUsers('');
    };

    // Return from search results
    const handleSearchBack = () => {
        setSearchUser([]);
        setSearchInput('');
        setActiveSection('chats');
    };

    // Handle logout
    const handleLogOut = async () => {
        const confirmlogout = window.prompt("type '" + authUser.username + "' To LOGOUT");
        
        if (confirmlogout === authUser.username) {
            setLoading(true);
            try {
                const logout = await axios.post('/api/auth/logout');
                const data = logout.data;
                
                if (data?.success === false) {
                    console.log(data?.message);
                } else {
                    toast.info(data?.message || "Logged out successfully");
                    localStorage.removeItem('chatapp');
                    setAuthUser(null);
                    navigate('/login');
                }
            } catch (error) {
                console.error("Logout error:", error);
                toast.error("Logout failed. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            toast.info("LogOut Cancelled");
        }
    };

    // Go to profile page
    const goToProfile = () => {
        // This will be handled by the parent component to switch to profile tab
        // The parent component should handle this via props or context
        if (authUser?._id) {
            // For now, we'll use a custom event to communicate with parent
            window.dispatchEvent(new CustomEvent('switchToProfile'));
        } else {
            toast.error("User profile not available");
        }
    };

    // Handle connect/disconnect functionality
    const handleConnect = async (user) => {
        try {
            // This would typically send a connection request
            toast.success(`Connection request sent to ${user.username}`);
            // You can implement actual connection logic here
        } catch (error) {
            console.error("Error sending connection request:", error);
            toast.error("Failed to send connection request");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Sidebar Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center space-x-3">
                    {authUser?.profilepic ? (
                        <img 
                            src={authUser.profilepic} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-white"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <FaUserCircle size={24} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold">{authUser?.username || 'User'}</h2>
                        <p className="text-sm text-blue-100">Professional Network</p>
                    </div>
                </div>
            </div>

            {/* Tab-specific Navigation */}
            {activeTab === 'messages' && (
                <div className="flex border-b border-gray-200 bg-white">
                    <button 
                        onClick={() => setActiveSection('search')}
                        className={`flex-1 py-3 text-center ${activeSection === 'search' || activeSection === 'search-results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    >
                        Search
                    </button>
                    <button 
                        onClick={() => setActiveSection('chats')}
                        className={`flex-1 py-3 text-center ${activeSection === 'chats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    >
                        Chats
                    </button>
                </div>
            )}

            {/* Network Section */}
            {activeTab === 'network' && (
                <div className="flex-grow overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Network Suggestions</h3>
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Search professionals..."
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <FaSearch />
                                </span>
                            </div>
                        </div>
                        
                        {networkLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                        ) : allUsers.length > 0 ? (
                            <div className="space-y-3">
                                {allUsers
                                    .filter(user => 
                                        searchInput === '' || 
                                        user.username.toLowerCase().includes(searchInput.toLowerCase()) ||
                                        (user.email && user.email.toLowerCase().includes(searchInput.toLowerCase()))
                                    )
                                    .map((user) => (
                                    <div 
                                        key={user._id}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                                    {user.profilepic ? (
                                                        <img 
                                                            src={user.profilepic} 
                                                            alt={user.username} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{user.username}</h4>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConnect(user)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-4">
                                    <FaUsers size={48} />
                                </div>
                                <p className="text-gray-600">No users found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Section */}
            {activeTab === 'profile' && (
                <div className="flex-grow overflow-y-auto p-4">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                            {authUser?.profilepic ? (
                                <img 
                                    src={authUser.profilepic} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {authUser?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{authUser?.username}</h3>
                        <p className="text-gray-600 mb-4">{authUser?.email}</p>
                        <button
                            onClick={goToProfile}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Search Section */}
            {activeTab === 'messages' && activeSection === 'search' && (
                <div className="p-4 flex-grow overflow-y-auto">
                    <form onSubmit={handleSearchSubmit} className="mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-grow">
                                <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Search users..."
                                    disabled={loading}
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <FaSearch />
                                </span>
                                {loading && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                    </span>
                                )}
                            </div>
                            
                            {/* Profile Picture */}
                            {authUser && (
                                <div 
                                    onClick={goToProfile} 
                                    className="cursor-pointer"
                                >
                                    {authUser.profilepic ? (
                                        <img 
                                            src={authUser.profilepic} 
                                            alt="Profile" 
                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                                            <FaUserCircle size={24} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit"
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>
            )}

            {/* Search Results Section */}
            {activeSection === 'search-results' && (
                <div className="p-4 flex-grow overflow-y-auto">
                    <div className="mb-3">
                        <button 
                            onClick={handleSearchBack}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <IoArrowBackSharp className="mr-1" /> Back to search
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Search Results</h3>
                    <div className="space-y-2">
                        {searchUser.map((user) => (
                            <div 
                                key={user._id}
                                className={`bg-white rounded-lg shadow hover:shadow-md p-3 cursor-pointer transition duration-200 ease-in-out ${selectedUserId === user._id ? 'bg-sky-500 text-white' : ''}`}
                                onClick={() => handleUserClick(user)}
                            >
                                <div className="flex items-center">
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                            {user.profilepic ? (
                                                <img 
                                                    src={user.profilepic} 
                                                    alt={user.username} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                                                    <FaUserCircle size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className={`font-medium ${selectedUserId === user._id ? 'text-white' : 'text-gray-800'}`}>
                                            {user.username}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chats Section */}
            {activeSection === 'chats' && (
                <div className="p-4 flex-grow overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Conversations</h3>
                    
                    {chatUsersLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : !apiAvailable ? (
                        // Show this when API endpoint is not available
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <div className="text-amber-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h1 className="font-bold text-xl mt-2">Chat Service Unavailable</h1>
                                <p className="text-gray-600 mt-1">The chat history service is currently unavailable</p>
                            </div>
                            <button
                                onClick={() => setActiveSection('search')}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                            >
                                Search for Users
                            </button>
                        </div>
                    ) : chatUser.length > 0 ? (
                        <div className="space-y-2">
                            {chatUser.map((user, index) => (
                                <div 
                                    key={user._id} 
                                    className={`bg-white rounded-lg shadow p-3 cursor-pointer hover:bg-gray-50 transition ${selectedUserId === user._id ? 'bg-sky-500 text-white' : ''}`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex items-center">
                                        <div className={`avatar ${isOnline[index] ? 'online' : ''}`}>
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                {user.profilepic ? (
                                                    <img 
                                                        src={user.profilepic} 
                                                        alt={user.username} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                                                        <FaUserCircle size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between items-center">
                                                <div className={`font-medium ${selectedUserId === user._id ? 'text-white' : 'text-gray-800'}`}>
                                                    {user.username}
                                                </div>
                                                {newMessageUsers.reciverId === authUser._id && newMessageUsers.senderId === user._id && (
                                                    <div className="rounded-full bg-green-700 text-sm text-white px-2">+1</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <div className="font-bold text-xl text-yellow-500 mb-4">
                                <h1>Why are you Alone!!🤔</h1>
                                <h1>Search username to chat</h1>
                            </div>
                            <button
                                onClick={() => setActiveSection('search')}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                            >
                                Find Users
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-2">
                    <button 
                        onClick={goToProfile} 
                        className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                        <FaUserCircle size={20} />
                        <span className="font-medium">My Profile</span>
                    </button>
                    <button 
                        onClick={handleLogOut}
                        className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                    >
                        <BiLogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;