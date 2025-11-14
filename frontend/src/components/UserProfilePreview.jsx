import React from 'react';

const UserProfilePreview = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    aria-label="Close profile preview"
                >
                    ✕
                </button>
                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                            {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{user.fullName || user.username}</h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                    {user.bio && (
                        <p className="text-gray-600 mb-4">{user.bio}</p>
                    )}
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                        {user.email && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">Email:</span>
                                <span>{user.email}</span>
                            </div>
                        )}
                        {user.location && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">Location:</span>
                                <span>{user.location}</span>
                            </div>
                        )}
                        {user.skills?.length > 0 && (
                            <div>
                                <span className="font-medium text-gray-800">Skills:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {user.skills.map((skill, index) => (
                                        <span key={index} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePreview;

