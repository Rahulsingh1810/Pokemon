const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Pokemon = require('../models/pokemonModel');

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
        const user = await User.findById(req.user.id).populate('battleDeck');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.battleDeck);
    } catch (error) {
        console.error('Error fetching deck:', error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
});

// Update user's battle deck
router.put('/deck', auth, async (req, res) => {
    try {
        const { pokemonNumber } = req.body;
        const user = await User.findById(req.user.id);

        // Check if the Pokémon is already in the deck
        if (user.battleDeck.some(pokemon => pokemon.number === pokemonNumber)) {
            return res.status(400).json({ message: 'Pokémon is already in the deck' });
        }

        // Check if the deck is full
        if (user.battleDeck.length >= 7) {
            return res.status(400).json({ message: 'Deck cannot exceed 7 Pokémon' });
        }

        // Add the Pokémon to the deck
        const pokemon = await Pokemon.findOne({ number: pokemonNumber });
        if (!pokemon) {
            return res.status(404).json({ message: 'Pokémon not found' });
        }

        user.battleDeck.push(pokemon);
        await user.save();

        res.json(user.battleDeck);
    } catch (error) {
        console.error('Error updating deck:', error);
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

// Add a Pokémon to the user's deck
router.post('/deck', auth, async (req, res) => {
    try {
        const { pokemonNumber } = req.body;
        const user = await User.findById(req.user.id);

        // Check if the Pokémon is already in the deck
        if (user.battleDeck.some(pokemon => pokemon.number === pokemonNumber)) {
            return res.status(400).json({ message: 'Pokémon is already in the deck' });
        }

        // Check if the deck is full
        if (user.battleDeck.length >= 7) {
            return res.status(400).json({ message: 'Deck cannot exceed 7 Pokémon' });
        }

        // Add the Pokémon to the deck
        const pokemon = await Pokemon.findOne({ number: pokemonNumber });
        if (!pokemon) {
            return res.status(404).json({ message: 'Pokémon not found' });
        }

        user.battleDeck.push(pokemon);
        await user.save();

        res.json(user.battleDeck);
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