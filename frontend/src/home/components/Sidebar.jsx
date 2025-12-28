import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCircle, FaComments } from 'react-icons/fa';
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from "react-icons/bi";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userConversation from '../../Zustans/useConversation';
import UserProfilePreview from '../../components/UserProfilePreview';

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
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [connections, setConnections] = useState([]);
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [previewUser, setPreviewUser] = useState(null);
    
    // Get the state and functions from Zustand store
    const { selectedConversation, setSelectedConversation, setMessages } = userConversation();

    // Fetch all users for networking
    useEffect(() => {
        const fetchAllUsers = async () => {
            if (activeTab !== 'network') return;
            
            setNetworkLoading(true);
            try {
                const response = await axios.get('https://professional-networking-system-2.onrender.com/api/users/all', {
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
                        const searchResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/user/search?search=', {
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

    useEffect(() => {
        const fetchSentConnectionRequests = async () => {
            if (activeTab !== 'network' && activeTab !== 'messages') return;

            try {
                const response = await axios.get('https://professional-networking-system-2.onrender.com/api/connection/sent', {
                    withCredentials: true
                });

                if (response.data.success) {
                    setSentRequests(new Set(response.data.sentRequests.map(req => req.recipient._id)));
                }
            } catch (error) {
                console.error("Error fetching sent connection requests:", error);
            }
        };

        if (authUser && (activeTab === 'network' || activeTab === 'messages')) {
            fetchSentConnectionRequests();
        }
    }, [authUser, activeTab]);

    // Fetch connection requests and connections
    useEffect(() => {
        const fetchConnectionData = async () => {
            if (activeTab !== 'network' && activeTab !== 'messages') return;
            
            setConnectionLoading(true);
            setConnectionsLoading(true);
            try {
                // Fetch connection requests (only for network tab)
                if (activeTab === 'network') {
                    const requestsResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/connection/requests', {
                        withCredentials: true
                    });
                    
                    if (requestsResponse.data.success) {
                        setConnectionRequests(requestsResponse.data.receivedRequests || []);
                    }
                }

                // Fetch connections (for both network and messages tabs)
                const connectionsResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/connection/list', {
                    withCredentials: true
                });
                
                if (connectionsResponse.data.success) {
                    setConnections(connectionsResponse.data.connections || []);
                }
            } catch (error) {
                console.error("Error fetching connection data:", error);
            } finally {
                setConnectionLoading(false);
                setConnectionsLoading(false);
            }
        };

        if (authUser && (activeTab === 'network' || activeTab === 'messages')) {
            fetchConnectionData();
        }
    }, [authUser, activeTab]);

    // Clear selected conversation when user changes (new login)
    useEffect(() => {
        if (authUser) {
            setSelectedConversation(null);
            setMessages([]);
            setSelectedUserId(null);
        }
    }, [authUser?._id, setSelectedConversation, setMessages]);

    // Fetch current chatters
    useEffect(() => {
        const fetchChatUsers = async () => {
            setChatUsersLoading(true);
            try {
                // Using the correct endpoint path
                const response = await axios.get('https://professional-networking-system-2.onrender.com/api/users/currentchatters', {
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

    // Clear selected conversation if the selected user is no longer in the chat list
    // But only if we have a chat list loaded - don't clear if list is still loading
    useEffect(() => {
        if (selectedConversation && !chatUsersLoading && chatUser.length > 0) {
            const isUserInList = chatUser.some(user => user._id === selectedConversation._id);
            if (!isUserInList) {
                // Check if user is actually connected before clearing
                const isConnected = isUserConnected(selectedConversation._id);
                if (!isConnected) {
                    setSelectedConversation(null);
                    setMessages([]);
                    setSelectedUserId(null);
                }
            }
        } else if (selectedConversation && !chatUsersLoading && chatUser.length === 0) {
            // Only clear if user is not connected
            const isConnected = isUserConnected(selectedConversation._id);
            if (!isConnected) {
                setSelectedConversation(null);
                setMessages([]);
                setSelectedUserId(null);
            }
        }
    }, [chatUser, selectedConversation, chatUsersLoading, setSelectedConversation, setMessages, connections]);

    // Handle search submission
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        
        if (!searchInput.trim()) {
            toast.info("Please enter a search term");
            return;
        }
        
        setLoading(true);
        try {
            const search = await axios.get(`https://professional-networking-system-2.onrender.com/api/user/search?search=${searchInput}`);
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
    const handleUserClick = async (user) => {
        // If user is connected, use handleMessageConnection to properly set up messaging
        if (isUserConnected(user._id)) {
            await handleMessageConnection(user);
        } else {
            // If not connected, just set the conversation (for search results)
            setSelectedConversation(user);
            setSelectedUserId(user._id);
            setNewMessageUsers('');
        }
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
                const logout = await axios.post('https://professional-networking-system-2.onrender.com/api/auth/logout');
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

    const handleMessageConnection = async (user) => {
        if (!user?._id) return;
        
        // Check if user is connected first
        const isConnected = isUserConnected(user._id);
        if (!isConnected) {
            toast.error("You must be connected to this user to send messages");
            return;
        }
        
        // Ensure user is in chatUser list, if not, refresh it first
        const isUserInChatList = chatUser.some(u => u._id === user._id);
        if (!isUserInChatList) {
            try {
                const chatResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/users/currentchatters', {
                    withCredentials: true
                });
                const chatData = chatResponse.data;
                if (Array.isArray(chatData)) {
                    setChatUser(chatData);
                    setIsOnline(new Array(chatData.length).fill(false));
                }
            } catch (err) {
                console.error("Error refreshing chat users:", err);
            }
        }
        
        // Set the conversation and switch to messages tab
        setSelectedConversation(user);
        setSelectedUserId(user._id);
        setNewMessageUsers('');
        
        // If we're in search results, switch to chats section
        if (activeSection === 'search-results' || activeSection === 'search') {
            setActiveSection('chats');
        }
        
        // Switch to messages tab (if not already there)
        if (activeTab !== 'messages') {
            window.dispatchEvent(new CustomEvent('switchToMessages'));
        }
    };

    // Handle connect/disconnect functionality
    const handleConnect = async (user) => {
        try {
            const response = await axios.post(`https://professional-networking-system-2.onrender.com/api/connection/send/${user._id}`, {
                message: `Hi ${user.username}, I'd like to connect with you!`
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success(`Connection request sent to ${user.username}`);
                const sentResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/connection/sent', {
                    withCredentials: true
                });
                if (sentResponse.data.success) {
                    setSentRequests(new Set(sentResponse.data.sentRequests.map(req => req.recipient._id)));
                }
            } else {
                toast.error(response.data.message || "Failed to send connection request");
            }
        } catch (error) {
            console.error("Error sending connection request:", error);
            if (error.response) {
                toast.error(error.response.data.message || "Failed to send connection request");
            } else {
                toast.error("Network error - please check your connection");
            }
        }
    };

    const openProfilePreview = (user) => setPreviewUser(user);
    const closeProfilePreview = () => setPreviewUser(null);
    const isRequestPending = (userId) => sentRequests.has(userId);
    const isUserConnected = (userId) => connections.some(conn => conn.user._id === userId);

    // Handle connection request response
    const handleConnectionResponse = async (connectionId, status, requesterUser = null) => {
        try {
            const response = await axios.put(`https://professional-networking-system-2.onrender.com/api/connection/respond/${connectionId}`, {
                status: status
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success(`Connection request ${status}`);
                // Remove from connection requests
                const updatedRequests = connectionRequests.filter(req => req._id !== connectionId);
                setConnectionRequests(updatedRequests);
                
                // If accepted, refresh connections and chat users list
                if (status === 'accepted') {
                    // Refresh connections list
                    try {
                        const connectionsResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/connection/list', {
                            withCredentials: true
                        });
                        if (connectionsResponse.data.success) {
                            const updatedConnections = connectionsResponse.data.connections || [];
                            setConnections(updatedConnections);
                            
                            // If we have the requester user info, we can message them immediately
                            if (requesterUser) {
                                // Refresh chat users list first
                                try {
                                    const chatResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/users/currentchatters', {
                                        withCredentials: true
                                    });
                                    const chatData = chatResponse.data;
                                    if (Array.isArray(chatData)) {
                                        setChatUser(chatData);
                                        setIsOnline(new Array(chatData.length).fill(false));
                                    }
                                } catch (err) {
                                    console.error("Error refreshing chat users:", err);
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Error refreshing connections:", err);
                    }
                    
                    // Refresh chat users list (always refresh)
                    try {
                        const chatResponse = await axios.get('https://professional-networking-system-2.onrender.com/api/users/currentchatters', {
                            withCredentials: true
                        });
                        const chatData = chatResponse.data;
                        if (Array.isArray(chatData)) {
                            setChatUser(chatData);
                            setIsOnline(new Array(chatData.length).fill(false));
                        }
                    } catch (err) {
                        console.error("Error refreshing chat users:", err);
                    }
                }
            } else {
                toast.error(response.data.message || `Failed to ${status} connection request`);
            }
        } catch (error) {
            console.error("Error responding to connection request:", error);
            if (error.response) {
                toast.error(error.response.data.message || `Failed to ${status} connection request`);
            } else {
                toast.error("Network error - please check your connection");
            }
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
                        {/* Connection Requests */}
                        {connectionRequests.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Requests</h3>
                                <div className="space-y-3">
                                    {connectionRequests.map((request) => (
                                        <div key={request._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        {request.requester.profilepic ? (
                                                            <img 
                                                                src={request.requester.profilepic} 
                                                                alt={request.requester.username} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                                {request.requester.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openProfilePreview(request.requester)}
                                                            className="font-semibold text-left text-gray-800 hover:text-blue-600 transition"
                                                        >
                                                            {request.requester.username}
                                                        </button>
                                                        <p className="text-sm text-gray-600">{request.message}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openProfilePreview(request.requester)}
                                                        className="border border-blue-600 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => handleConnectionResponse(request._id, 'accepted', request.requester)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleConnectionResponse(request._id, 'rejected')}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* My Connections */}
                        {connections.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">My Connections ({connections.length})</h3>
                                <div className="space-y-3">
                                    {connections.map((connection) => (
                                        <div key={connection._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        {connection.user.profilepic ? (
                                                            <img 
                                                                src={connection.user.profilepic} 
                                                                alt={connection.user.username} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                                                {connection.user.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openProfilePreview(connection.user)}
                                                            className="font-semibold text-left text-gray-800 hover:text-blue-600 transition"
                                                        >
                                                            {connection.user.username}
                                                        </button>
                                                        <p className="text-sm text-gray-600">{connection.user.fullName || 'Connection'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleMessageConnection(connection.user)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                                                    >
                                                        Message Now
                                                    </button>
                                                    <button
                                                        onClick={() => openProfilePreview(connection.user)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-600 text-blue-700 hover:bg-blue-50 transition"
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                                    <button
                                                        type="button"
                                                        onClick={() => openProfilePreview(user)}
                                                        className="font-semibold text-left text-gray-800 hover:text-blue-700 transition"
                                                    >
                                                        {user.username}
                                                    </button>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => isUserConnected(user._id) ? handleMessageConnection(user) : handleConnect(user)}
                                                disabled={loading || isRequestPending(user._id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    isUserConnected(user._id)
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : isRequestPending(user._id)
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                } disabled:opacity-70`}
                                            >
                                                {isUserConnected(user._id)
                                                    ? 'Message Now'
                                                    : isRequestPending(user._id)
                                                        ? 'Request Sent'
                                                        : 'Connect Now'}
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
                        {searchUser.map((user) => {
                            const isConnected = isUserConnected(user._id);
                            const isPending = isRequestPending(user._id);
                            
                            return (
                                <div 
                                    key={user._id}
                                    className={`bg-white rounded-lg shadow hover:shadow-md p-3 transition duration-200 ease-in-out ${selectedUserId === user._id ? 'bg-sky-50 border-2 border-sky-500' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div 
                                            className="flex items-center flex-1 cursor-pointer"
                                            onClick={() => handleUserClick(user)}
                                        >
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
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openProfilePreview(user);
                                                    }}
                                                    className={`font-medium text-left hover:underline ${selectedUserId === user._id ? 'text-sky-700' : 'text-gray-800'}`}
                                                >
                                                    {user.username}
                                                </button>
                                                {user.fullName && (
                                                    <p className={`text-xs ${selectedUserId === user._id ? 'text-sky-600' : 'text-gray-500'}`}>
                                                        {user.fullName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-3" onClick={(e) => e.stopPropagation()}>
                                            {isConnected ? (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await handleMessageConnection(user);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                                                >
                                                    Message
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConnect(user);
                                                    }}
                                                    disabled={isPending || loading}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                        isPending
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    } disabled:opacity-70`}
                                                >
                                                    {isPending ? 'Request Sent' : 'Connect'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                                    className={`rounded-lg shadow p-3 cursor-pointer transition ${
                                        selectedUserId === user._id 
                                            ? 'bg-sky-500 text-white' 
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
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
                                                    <div className={`w-full h-full flex items-center justify-center ${
                                                        selectedUserId === user._id 
                                                            ? 'bg-white/20 text-white' 
                                                            : 'bg-blue-100 text-blue-500'
                                                    }`}>
                                                        <FaUserCircle size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                <div className={`font-medium ${selectedUserId === user._id ? 'text-white' : 'text-gray-800'}`}>
                                                    {user.username}
                                                    </div>
                                                    {user.fullName && (
                                                        <div className={`text-sm ${selectedUserId === user._id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            {user.fullName}
                                                        </div>
                                                    )}
                                                </div>
                                                {newMessageUsers.reciverId === authUser._id && newMessageUsers.senderId === user._id && (
                                                    <div className={`rounded-full text-sm px-2 ${
                                                        selectedUserId === user._id 
                                                            ? 'bg-white/30 text-white' 
                                                            : 'bg-green-700 text-white'
                                                    }`}>+1</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                            <div className="mb-6">
                                <FaComments className="text-6xl text-gray-300 mb-4 mx-auto" />
                                <h2 className="text-xl font-bold text-gray-600 mb-2">No conversations yet</h2>
                                <p className="text-gray-500 mb-4">Connect with other users to start chatting</p>
                            </div>
                            <div className="space-y-3">
                            <button
                                onClick={() => setActiveSection('search')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition w-full"
                                >
                                    Find Users to Connect
                                </button>
                                <button
                                    onClick={() => setActiveSection('network')}
                                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition w-full"
                                >
                                    View My Network
                            </button>
                            </div>
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
            <UserProfilePreview user={previewUser} onClose={closeProfilePreview} />
        </div>
    );
};

export default Sidebar;
