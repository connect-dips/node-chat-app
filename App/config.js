/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const config = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: process.env.AUTHORITY,
        clientSecret: process.env.CLIENT_SECRET,
    },
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'http://localhost:3000'
    }
};

// Define redirect URIs
const REDIRECT_URI = `${config.server.host}/auth/redirect`;
const POST_LOGOUT_REDIRECT_URI = `${config.server.host}/`;

module.exports = {
    ...config,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
}; 