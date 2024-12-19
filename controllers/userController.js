const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register User
const registerUser = async (req, res) => {
    const { firstName, lastName, NIDNumber, phoneNumber, password, bloodGroup } = req.body;

    try {
        const userExists = await User.findOne({ NIDNumber });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ firstName, lastName, NIDNumber, phoneNumber, password, bloodGroup });
        const token = generateToken(user._id);

        res.cookie('token', token, { httpOnly: true });
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { NIDNumber, password } = req.body;

    try {
        const user = await User.findOne({ NIDNumber });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true });
            res.json({ user, token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser, getAllUsers };
