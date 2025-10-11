// userhandlerController.js
import Conversation from "../Models/conversationModels.js";
import User from "../Models/userModels.js";

export const getUserBySearch = async (req, res) => {
    try {
        const search = req.query.search || '';
        const currentUserID = req.user._id; // Get user ID from the user object

        console.log("Search Query:", search); // Debugging
        console.log("Current User ID:", currentUserID); // Debugging

        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { fullName: { $regex: '.*' + search + '.*', $options: 'i' } }
                    ]
                },
                {
                    _id: { $ne: currentUserID } // Exclude the current user
                }
            ]
        }).select("-password").select("email fullName username"); // Include fullName and username in the response

        res.status(200).send(users);
    } catch (error) {
        console.error("Error in getUserBySearch:", error);
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};


export const getCurrentChatters = async (req, res) => {
    try {
        const currentUserID = req.user._id; // Get user ID from the authenticated user

        // Find conversations where the current user is a participant
        const currentChatters = await Conversation.find({
            participants: currentUserID 
        }).sort({ updatedAt: -1 });

        // If no conversations, return an empty array
        if (!currentChatters || currentChatters.length === 0) {
            return res.status(200).json([]);
        }

        // Extract unique participant IDs, excluding the current user
        const participantsIDs = [...new Set(
            currentChatters.flatMap(conversation => 
                conversation.participants.filter(id => 
                    id.toString() !== currentUserID.toString()
                )
            )
        )];

        // Fetch user details for these participants
        const users = await User.find({ 
            _id: { $in: participantsIDs } 
        }).select("-password -email"); // Exclude sensitive information

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getCurrentChatters:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const users = await User.find({ _id: { $ne: currentUserID } })
            .select("-password")
            .select("email fullName username");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        console.log('getProfile called');
        console.log('req.user:', req.user);
        
        const userId = req.user._id; // Get user ID from the authenticated user
        console.log('Looking for user with ID:', userId);
        
        const user = await User.findById(userId).select('-password');
        console.log('Found user:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('Returning profile for user:', user.username);
        res.status(200).json({ success: true, profile: user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
