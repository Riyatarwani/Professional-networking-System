import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import userConversation from '../Zustans/useConversation';
import UserProfilePreview from './UserProfilePreview';

const ConnectionManager = () => {
    const [users, setUsers] = useState([]);
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [previewUser, setPreviewUser] = useState(null);

    const { setSelectedConversation } = userConversation();

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://professional-networking-system-1.onrender.com/api/users/all', {
                withCredentials: true
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const response = await axios.get('https://professional-networking-system-1.onrender.com/api/connection/sent', {
                withCredentials: true
            });

            if (response.data.success) {
                const pendingRecipients = new Set(
                    (response.data.sentRequests || []).map(req => req.recipient._id)
                );
                setSentRequests(pendingRecipients);
            }
        } catch (error) {
            console.error('Error fetching sent requests:', error);
        }
    };

    // Fetch connection requests
    const fetchConnectionRequests = async () => {
        try {
            const response = await axios.get('https://professional-networking-system-1.onrender.com/api/connection/requests', {
                withCredentials: true
            });
            setConnectionRequests(response.data.receivedRequests || []);
        } catch (error) {
            console.error('Error fetching connection requests:', error);
        }
    };

    // Fetch connections
    const fetchConnections = async () => {
        try {
            const response = await axios.get('https://professional-networking-system-1.onrender.com/api/connection/list', {
                withCredentials: true
            });
            setConnections(response.data.connections || []);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    // Send connection request
    const sendConnectionRequest = async (userId) => {
        try {
            setLoading(true);
            const response = await axios.post(`https://professional-networking-system-1.onrender.com/api/connection/send/${userId}`, {
                message: "Hi! I'd like to connect with you."
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success('Connection request sent!');
                await fetchSentRequests();
                fetchUsers(); // Refresh users list
            }
        } catch (error) {
            toast.error('Failed to send connection request');
            console.error('Error sending connection request:', error);
        } finally {
            setLoading(false);
        }
    };

    // Accept connection request
    const acceptConnection = async (connectionId) => {
        try {
            const response = await axios.put(`https://professional-networking-system-1.onrender.com/api/connection/respond/${connectionId}`, {
                status: 'accepted'
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success('Connection accepted!');
                fetchConnectionRequests();
                fetchConnections();
                fetchUsers(); // Refresh users list to update button states
            }
        } catch (error) {
            toast.error('Failed to accept connection');
            console.error('Error accepting connection:', error);
        }
    };

    // Reject connection request
    const rejectConnection = async (connectionId) => {
        try {
            const response = await axios.put(`https://professional-networking-system-1.onrender.com/api/connection/respond/${connectionId}`, {
                status: 'rejected'
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success('Connection rejected');
                fetchConnectionRequests();
            }
        } catch (error) {
            toast.error('Failed to reject connection');
            console.error('Error rejecting connection:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchConnectionRequests();
        fetchConnections();
        fetchSentRequests();
    }, []);

    // Check if user is already connected
    const isUserConnected = (userId) => {
        return connections.some(conn => conn.user._id === userId);
    };

    const openProfilePreview = (user) => {
        setPreviewUser(user);
    };

    const closeProfilePreview = () => setPreviewUser(null);

    const handleMessageConnection = (user) => {
        if (!user?._id) return;
        setSelectedConversation(user);
        window.dispatchEvent(new CustomEvent('switchToMessages'));
    };

    const isRequestPending = (userId) => sentRequests.has(userId);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
                <p className="text-blue-500 text-sm tracking-[0.35em] uppercase font-semibold">Network Hub</p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Grow Meaningful Connections</h1>
                <p className="text-gray-500 mt-2">Send thoughtful requests, track pending invitations, and jump into conversations in one place.</p>
            </div>
            
            {/* Connection Requests */}
            {connectionRequests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-yellow-600">Connection Requests</h2>
                    <div className="grid gap-4">
                        {connectionRequests.map((request) => (
                            <div key={request._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {request.requester.username?.charAt(0).toUpperCase()}
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
                                            onClick={() => acceptConnection(request._id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => rejectConnection(request._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Reject
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
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-green-600">My Connections ({connections.length})</h2>
                    <div className="grid gap-4">
                        {connections.map((connection) => (
                            <div key={connection._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {connection.user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => openProfilePreview(connection.user)}
                                                className="font-semibold text-left text-gray-800 hover:text-blue-700 transition"
                                            >
                                                {connection.user.username}
                                            </button>
                                            <p className="text-sm text-gray-600">{connection.user.fullName || 'Connected'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleMessageConnection(connection.user)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                                        >
                                            Message Now
                                        </button>
                                        <button
                                            onClick={() => openProfilePreview(connection.user)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-600 text-blue-700 hover:bg-blue-50 transition"
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

            {/* Network Suggestions */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Network Suggestions</h2>
                <div className="grid gap-4">
                    {users.map((user) => {
                        const connected = isUserConnected(user._id);
                        const pending = isRequestPending(user._id);
                        const buttonLabel = connected
                            ? 'Message Now'
                            : pending
                                ? 'Request Sent'
                                : 'Connect Now';
                        return (
                        <div key={user._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => openProfilePreview(user)}
                                            className="font-semibold text-left text-gray-800 hover:text-blue-700 transition"
                                        >
                                            {user.username}
                                        </button>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => connected ? handleMessageConnection(user) : sendConnectionRequest(user._id)}
                                    disabled={loading || pending}
                                    className={`px-4 py-2 rounded font-medium transition ${
                                        connected
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : pending
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                    } disabled:opacity-60`}
                                >
                                    {loading && !connected && !pending ? 'Sending...' : buttonLabel}
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            </div>

            <UserProfilePreview user={previewUser} onClose={closeProfilePreview} />
        </div>
    );
};

export default ConnectionManager;
