// MessageContainer.jsx
import React, { useEffect, useState, useRef } from 'react'
import userConversation from '../../Zustans/useConversation';
import { useAuth } from '../../context/AuthContext';
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from 'react-icons/io5';
import axios from 'axios';

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
                const response = await api.get(`/api/message/${selectedConversation._id}`);
                const data = response.data;
                
                if (data.success === false) {
                    console.log(data.message);
                    return;
                }
                
                setMessages(data.messages);
            } catch (error) {
                console.log("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        }

        if (selectedConversation?._id) getMessages();
    }, [selectedConversation?._id, setMessages])

    const handleMessages = (e) => {
        setSendData(e.target.value);
    }

    const handleSendMessage = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        
        if (!sendData.trim() || !selectedConversation?._id) return;
        
        setSending(true);
        try {
            const response = await api.post(
                `/api/message/send/${selectedConversation._id}`,
                { message: sendData }
            );
            
            const data = response.data;
            
            if (data.success === false) {
                console.log(data.message);
                return;
            }
            
            // Update messages with the new message
            setMessages([...messages, {
                ...data.message,
                senderId: authUser._id // Ensure senderId is set
            }]);
            setSendData(''); // Clear input field
        } catch (error) {
            console.log("Error sending message:", error);
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
        return message.senderId === authUser._id;
    };

    return (
        <div className='flex flex-col h-screen w-full bg-blue-50'>
            {selectedConversation === null ? (
                <div className='flex items-center justify-center w-full h-full bg-blue-800'>
                    <div className='px-4 text-center text-white flex flex-col items-center gap-2'>
                        <p className='text-2xl'>Welcome!!👋 {authUser.username}😉</p>
                        <p className="text-lg">Select a chat to start messaging</p>
                        <TiMessages className='text-6xl text-center' />
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
                            <div>
                                <img 
                                    className='rounded-full w-9 h-9 md:w-10 md:h-10 object-cover' 
                                    src={selectedConversation?.profilepic} 
                                    alt="Profile"
                                />
                            </div>
                            <div>
                                <span className='text-white font-medium text-base md:text-lg'>
                                    {selectedConversation?.username}
                                </span>
                                <p className='text-xs text-gray-100'>Online</p>
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
                        {!loading && messages?.length === 0 && (
                            <p className='text-center text-gray-600 bg-white bg-opacity-75 p-3 rounded-lg shadow'>
                                Send a message to start the conversation
                            </p>
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
                    <div className='p-2 bg-blue-100'>
                        <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
                            <div className='flex items-center bg-white rounded-full flex-1 px-4 py-2'>
                                <input
                                    value={sendData}
                                    onChange={handleMessages}
                                    onKeyDown={handleKeyDown}
                                    required
                                    id='message'
                                    type='text'
                                    className='flex-1 bg-transparent outline-none text-gray-800'
                                    placeholder="Type a message..."
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={sending}
                                className="bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                            >
                                {sending ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                ) : (
                                    <IoSend size={18} />
                                )}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    )
}

export default MessageContainer;
