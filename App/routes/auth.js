/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
const msal = require('@azure/msal-node');
const config = require('../config');

const authProvider = require('../auth/AuthProvider');

const router = express.Router();

const msalConfig = {
    auth: {
        clientId: config.auth.clientId,
        authority: config.auth.authority,
        clientSecret: config.auth.clientSecret,
        redirectUri: config.REDIRECT_URI,
        postLogoutRedirectUri: config.POST_LOGOUT_REDIRECT_URI,
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

router.get('/signin', authProvider.login({
    scopes: [],
    redirectUri: config.REDIRECT_URI,
    successRedirect: '/auth/callback'
}));

router.get('/acquireToken', authProvider.acquireToken({
    scopes: ['User.Read'],
    redirectUri: config.REDIRECT_URI,
    successRedirect: '/users/profile'
}));

router.post('/redirect', authProvider.handleRedirect({
    successRedirect: '/auth/callback'
}));

// Handle both GET and POST for signout
router.all('/signout', async (req, res) => {
    try {
        // Clear the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
        });

        // If it's a POST request, return JSON response
        if (req.method === 'POST') {
            res.json({ success: true, message: 'Logged out successfully' });
            return;
        }

        // For GET requests, redirect to Microsoft logout
        authProvider.logout({
            postLogoutRedirectUri: config.POST_LOGOUT_REDIRECT_URI
        })(req, res);
    } catch (error) {
        console.error('Signout error:', error);
        if (req.method === 'POST') {
            res.status(500).json({ success: false, message: 'Error during logout' });
        } else {
            res.redirect('/');
        }
    }
});

// Add auth status endpoint
router.get('/status', (req, res) => {
    res.json({
        isAuthenticated: req.session.isAuthenticated || false,
        user: req.session.user || null
    });
});

module.exports = router;
