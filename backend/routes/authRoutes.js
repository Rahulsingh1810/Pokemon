const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Pokemon = require('../models/pokemonModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email provider
    auth: {
        user: process.env.EMAIL_USER, // Set in .env
        pass: process.env.EMAIL_PASS  // Set in .env
    }
});

// Register route


router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword, profilePicture } = req.body;

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' });
    }

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

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        });
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
        console.error('Error fetching deck:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add Pokémon to deck
router.post('/deck', auth, async (req, res) => {
    try {
        const { pokemonNumber } = req.body;
        const user = await User.findById(req.user.id).populate('battleDeck');

        // Check for duplicates using populated data
        if (user.battleDeck.some(pokemon => pokemon.number === pokemonNumber)) {
            return res.status(400).json({ message: 'Pokémon is already in the deck' });
        }

        if (user.battleDeck.length >= 7) {
            return res.status(400).json({ message: 'Deck cannot exceed 7 Pokémon' });
        }

        const pokemon = await Pokemon.findOne({ number: pokemonNumber });
        if (!pokemon) {
            return res.status(404).json({ message: 'Pokémon not found' });
        }

        user.battleDeck.push(pokemon);
        await user.save();

        const updatedUser = await User.findById(req.user.id).populate('battleDeck');
        res.json(updatedUser.battleDeck);
    } catch (error) {
        console.error('Error adding Pokémon to deck:', error);
        res.status(500).json({ message: error.message });
    }
});

// Remove Pokémon from deck
router.delete('/deck/:pokemonNumber', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log('Before removal, battleDeck (raw ObjectIds):', user.battleDeck);

        // Filter out Pokémon by number (not populated yet)
        const pokemonToRemove = await Pokemon.findOne({ number: req.params.pokemonNumber });
        if (!pokemonToRemove) {
            return res.status(404).json({ message: 'Pokémon not found' });
        }

        const initialLength = user.battleDeck.length;
        // Remove all instances of the Pokémon's ObjectId
        user.battleDeck = user.battleDeck.filter(
            id => id.toString() !== pokemonToRemove._id.toString()
        );

        console.log('After filter, battleDeck (raw ObjectIds):', user.battleDeck);
        if (initialLength === user.battleDeck.length) {
            console.log('No Pokémon was removed - check ObjectId match');
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('battleDeck');
        console.log('After save, populated battleDeck:', JSON.stringify(updatedUser.battleDeck, null, 2));
        res.json({ message: 'Pokémon removed from deck', deck: updatedUser.battleDeck });
    } catch (error) {
        console.error('Error removing Pokémon from deck:', error);
        res.status(500).json({ message: error.message });
    }
});


// Add new route
router.post('/save-battle', auth, async (req, res) => {
    const { userId, opponentId, score } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.battleHistory.push({ opponentId, score });
      await user.save();
      res.json({ message: 'Battle result saved' });
    } catch (error) {
      console.error('Error saving battle result:', error);
      res.status(500).json({ message: error.message });
    }
  });

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

//forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpire = Date.now() + 3600000; // Expires in 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetTokenExpire;
        await user.save();

        // Send reset email
        const resetUrl = `http://localhost:3000/reset-password.html?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request - Pokémon',
            text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`
        });

        res.json({ message: 'Password reset link sent' });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Error sending reset link' });
    }
});


// Add after /forgot-password route
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    // Validate password strength (consistent with /register)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update password and clear token
        user.password = password; // Will be hashed by pre-save hook
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

module.exports = router;