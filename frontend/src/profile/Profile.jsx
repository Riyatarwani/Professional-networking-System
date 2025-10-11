import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaGraduationCap, FaCode, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const { authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log('Fetching profile for user:', authUser);
                const response = await axios.get('/api/users/profile', {
                    withCredentials: true
                });
                
                console.log('Profile response:', response.data);
                
                if (response.data.success) {
                    setProfile(response.data.profile);
                    setEditData(response.data.profile);
                } else {
                    console.error('Profile fetch failed:', response.data.message);
                    toast.error(response.data.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    toast.error(error.response.data?.message || 'Failed to load profile');
                } else {
                    toast.error('Network error - please check your connection');
                }
            } finally {
                setLoading(false);
            }
        };

        if (authUser) {
            fetchProfile();
        } else {
            console.log('No authUser found, skipping profile fetch');
            setLoading(false);
        }
    }, [authUser]);

    const handleEdit = () => {
        setEditing(true);
        setEditData(profile);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditData(profile);
    };

    const handleSave = async () => {
        try {
            // Here you would typically call an update API
            // For now, we'll just simulate saving
            setProfile(editData);
            setEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (!profile) {
        // Fallback: use authUser data if available
        if (authUser) {
            console.log('Using authUser as fallback profile data');
            return (
                <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                            <div className="flex items-center space-x-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
                                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                        {authUser.username?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{authUser.username}</h1>
                                    <p className="text-lg text-gray-600 mb-4">{authUser.email}</p>
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                        <p className="text-yellow-800 text-sm">
                                            Profile data is being loaded from your session. Some details may be limited.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600">Unable to load your profile information.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
                                {profile.avatar && profile.avatar !== 'default-avatar.png' ? (
                                    <img 
                                        src={profile.avatar} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                        {profile.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editData.fullName || ''}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-3xl font-bold"
                                        />
                                    ) : (
                                        profile.fullName || profile.username
                                    )}
                                </h1>
                                <p className="text-lg text-gray-600 mb-4">@{profile.username}</p>
                                <div className="flex space-x-4">
                                    {editing ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <FaSave />
                                                <span>Save</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <FaTimes />
                                                <span>Cancel</span>
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEdit}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                        >
                                            <FaEdit />
                                            <span>Edit Profile</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                        <div className="text-gray-600">Connections</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                        <div className="text-gray-600">Messages</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                        <div className="text-gray-600">Posts</div>
                    </div>
                </div>

                {/* Profile Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaUser className="mr-2 text-blue-600" />
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="flex items-center space-x-2">
                                    <FaEnvelope className="text-gray-400" />
                                    <span className="text-gray-800">{profile.email}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <span className="text-gray-800 capitalize">{profile.gender}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <div className="flex items-center space-x-2">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editData.location || ''}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{profile.location}</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <div className="flex items-center space-x-2">
                                    <FaPhone className="text-gray-400" />
                                    {editing ? (
                                        <input
                                            type="tel"
                                            value={editData.phoneNumber || ''}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{profile.phoneNumber}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaGraduationCap className="mr-2 text-green-600" />
                            Education
                        </h3>
                        {profile.education && (profile.education.institute || profile.education.degree || profile.education.field) ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editData.education?.institute || ''}
                                            onChange={(e) => handleInputChange('education.institute', e.target.value)}
                                            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{profile.education.institute}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editData.education?.degree || ''}
                                            onChange={(e) => handleInputChange('education.degree', e.target.value)}
                                            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{profile.education.degree}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editData.education?.field || ''}
                                            onChange={(e) => handleInputChange('education.field', e.target.value)}
                                            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{profile.education.field}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={editData.education?.year || ''}
                                            onChange={(e) => handleInputChange('education.year', e.target.value)}
                                            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{profile.education.year}</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No education information provided</p>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaCode className="mr-2 text-purple-600" />
                            Skills
                        </h3>
                        {profile.skills && profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span 
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No skills listed</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">About</h3>
                        {editing ? (
                            <textarea
                                value={editData.bio || ''}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none"
                                placeholder="Tell us about yourself..."
                                maxLength={200}
                            />
                        ) : (
                            <p className="text-gray-600 leading-relaxed">
                                {profile.bio || "No bio provided. Click 'Edit Profile' to add one."}
                            </p>
                        )}
                        {editing && (
                            <p className="text-xs text-gray-500 mt-1">
                                {(editData.bio || '').length}/200 characters
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
