// MessageContainer.jsx
import React, { useEffect, useState, useRef } from 'react'
import userConversation from '../../Zustans/useConversation';
import { useAuth } from '../../context/AuthContext';
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserProfilePreview from '../../components/UserProfilePreview';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

const MessageContainer = ({ onBackUser }) => {
    const { messages, selectedConversation, setMessages } = userConversation();
    const { authUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendData, setSendData] = useState("");
    const [connectionError, setConnectionError] = useState(false);
    const [previewUser, setPreviewUser] = useState(null);
    const lastMessageRef = useRef();
    const messagesContainerRef = useRef();


    // Auto-scroll to the bottom of messages
    useEffect(() => {
        if (lastMessageRef?.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Fetch messages when selected conversation changes
    useEffect(() => {
        const getMessages = async () => {
            if (!selectedConversation?._id) return;
            
            setLoading(true);
            try {
                // First get or create conversation
                const conversationResponse = await api.get(`/api/message/conversation/${selectedConversation._id}`);
                const conversationData = conversationResponse.data;
                
                if (conversationData.success === false) {
                    console.log("Conversation creation failed:", conversationData.message);
                    setMessages([]);
                    setConnectionError(true);
                    toast.error(conversationData.message || "You must be connected to this user to start a conversation");
                    return;
                }
                
                setConnectionError(false);
                
                // Then get messages for the conversation
                const response = await api.get(`/api/message/${conversationData.conversation._id}`);
                const data = response.data;
                
                if (data.success === false) {
                    console.log("Message fetch failed:", data.message);
                    setMessages([]);
                    return;
                }
                
                setMessages(data.messages || []);
            } catch (error) {
                console.log("Error fetching messages:", error);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        }

        if (selectedConversation?._id) {
            getMessages();
        }
    }, [selectedConversation?._id, setMessages])

    const handleMessages = (e) => {
        setSendData(e.target.value);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        
        if (!sendData.trim() || !selectedConversation?._id) {
            return;
        }
        
        const messageText = sendData.trim();
        
        setSending(true);
        
        // Optimistically add message to UI
        const tempMessage = {
            _id: `temp_${Date.now()}`,
            senderId: authUser._id,
            receiverId: selectedConversation._id,
            message: messageText,
            createdAt: new Date().toISOString(),
            isTemporary: true
        };
        
        setMessages(prev => [...prev, tempMessage]);
        setSendData(''); // Clear input field immediately
        
        try {
            const response = await api.post(
                `/api/message/send/${selectedConversation._id}`,
                { message: messageText }
            );
            
            const data = response.data;
            
            if (data.success === false) {
                // Remove temporary message on failure
                setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
                toast.error(data.message || "Failed to send message");
                return;
            }
            
            // Replace temporary message with real message
            setMessages(prev => prev.map(msg => 
                msg._id === tempMessage._id ? data.message : msg
            ));
            
        } catch (error) {
            console.error("Error sending message:", error);
            
            // Remove temporary message on error
            setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    }

    // Determine if a message is from the current user (for alignment)
    const isCurrentUserMessage = (message) => {
        // Handle both ObjectId and populated user object
        const messageSenderId = message.senderId?._id || message.senderId;
        return messageSenderId === authUser._id;
    };

    return (
        <div className='flex flex-col h-screen w-full bg-blue-50'>
            {selectedConversation === null ? (
                <div className='flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-blue-800'>
                    <div className='px-6 text-center text-white flex flex-col items-center gap-4'>
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                            <TiMessages className='text-4xl' />
                        </div>
                        <h2 className='text-3xl font-bold'>Welcome, {authUser.username}! 👋</h2>
                        <p className="text-lg text-blue-100">Select a conversation to start messaging</p>
                        <div className="mt-4 text-sm text-blue-200">
                            <p>Connect with other professionals and start meaningful conversations</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className='bg-blue-700 px-4 py-3 flex items-center shadow-md'>
                        <div className='md:hidden mr-2'>
                            <button 
                                onClick={() => onBackUser(true)} 
                                className='text-white'
                            >
                                <IoArrowBackSharp size={22} />
                            </button>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className="relative">
                                <img 
                                    className='rounded-full w-9 h-9 md:w-10 md:h-10 object-cover' 
                                    src={selectedConversation?.profilepic || selectedConversation?.avatar} 
                                    alt="Profile"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="rounded-full w-9 h-9 md:w-10 md:h-10 bg-blue-500 flex items-center justify-center text-white font-bold text-sm hidden">
                                    {selectedConversation?.username?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setPreviewUser(selectedConversation)}
                                    className='text-white font-medium text-base md:text-lg text-left hover:underline decoration-white/60'
                                >
                                    {selectedConversation?.username}
                                </button>
                                {selectedConversation?.fullName && (
                                    <p className='text-xs text-blue-100'>{selectedConversation.fullName}</p>
                                )}
                                <p className='text-xs text-gray-100'>Connected</p>
                            </div>
                        </div>
                    </div>
            
                    {/* Messages Container */}
                    <div 
                        ref={messagesContainerRef}
                        className='flex-1 overflow-y-auto p-4 bg-[#e6f0f9] bg-opacity-90 bg-[url("https://i.pinimg.com/originals/ab/ab/60/abab60f06ab52fa7846593e6ae0c9a0b.png")] bg-repeat'
                    >
                        {loading && (
                            <div className="flex w-full h-full flex-col items-center justify-center gap-4">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                        )}
                        {!loading && messages?.length === 0 && !connectionError && (
                            <div className='text-center text-gray-600 bg-white bg-opacity-75 p-6 rounded-lg shadow'>
                                <p className="mb-4">Send a message to start the conversation</p>
                                <div className="text-sm text-gray-500">
                                    <p>Make sure you're connected to this user before messaging</p>
                                </div>
                            </div>
                        )}
                        {!loading && connectionError && (
                            <div className='text-center text-gray-600 bg-red-50 border border-red-200 p-6 rounded-lg shadow'>
                                <div className="text-red-600 mb-4">
                                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold mb-2">Not Connected</h3>
                                    <p className="mb-4">You need to be connected to this user to send messages</p>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/network'}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    Go to Network
                                </button>
                            </div>
                        )}
                        {!loading && messages?.length > 0 && (
                            <div className="space-y-2">
                                {messages.map((message, index) => {
                                    const isLastMessage = index === messages.length - 1;
                                    const isSender = isCurrentUserMessage(message);
                                    
                                    return (
                                        <div 
                                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                                            key={message?._id || index} 
                                            ref={isLastMessage ? lastMessageRef : null}
                                        >
                                            <div 
                                                className={`max-w-xs md:max-w-md rounded-lg p-3 shadow-sm
                                                ${isSender 
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none' 
                                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                                                }`}
                                            >
                                                <p className={`text-sm md:text-base whitespace-pre-wrap break-words ${isSender ? 'text-white' : 'text-gray-800'}`}>
                                                    {message?.message}
                                                </p>
                                                <p className={`text-xs mt-1 flex justify-end items-center gap-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {new Date(message?.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    {isSender && (
                                                        <span className="text-blue-200">✓</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    {/* Message Input */}
                    {!connectionError && (
                    <div className='p-2 bg-blue-100'>
                        <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
                            <div className='flex items-center bg-white rounded-full flex-1 px-4 py-2'>
                                <input
                                    value={sendData}
                                    onChange={handleMessages}
                                    onKeyDown={handleKeyDown}
                                    id='message'
                                    type='text'
                                    className='flex-1 bg-transparent outline-none text-gray-800'
                                    placeholder="Type a message..."
                                />
                            </div>
                            <button 
                                type="submit" 
                                    disabled={sending || !sendData.trim()}
                                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white transition-colors ${
                                        sending || !sendData.trim() 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                    title={sending ? "Sending..." : !sendData.trim() ? "Type a message" : "Send message"}
                            >
                                {sending ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                ) : (
                                    <IoSend size={18} />
                                )}
                            </button>
                        </form>
                    </div>
                    )}
                    <UserProfilePreview user={previewUser} onClose={() => setPreviewUser(null)} />
                </>
            )}
        </div>
    )
}

export default MessageContainer;
