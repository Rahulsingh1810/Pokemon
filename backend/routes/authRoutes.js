const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register route
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword, profilePicture } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            profilePicture
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                battleDeck: user.battleDeck,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's battle deck
router.get('/deck', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.battleDeck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user's battle deck
router.put('/deck', auth, async (req, res) => {
    try {
        const { deck } = req.body;
        
        // Validate deck size
        if (deck.length > 7) {
            return res.status(400).json({ message: 'Deck cannot exceed 7 Pokemon' });
        }

        const user = await User.findById(req.user.id);
        user.battleDeck = deck;
        await user.save();

        res.json({ message: 'Battle deck updated successfully', deck: user.battleDeck });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove Pokemon from deck
router.delete('/deck/:pokemonNumber', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.battleDeck = user.battleDeck.filter(
            pokemon => pokemon.number !== req.params.pokemonNumber
        );
        await user.save();

        res.json({ message: 'Pokemon removed from deck', deck: user.battleDeck });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = router;