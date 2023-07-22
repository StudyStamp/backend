// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

exports.generateToken = async (user) => {
    return jwt.sign({ userId: user._id }, 'thisismysecretkey', { expiresIn: '1h' });
}

const refreshToken = async (user) => {
    const newToken = jwt.sign({ userId: user._id }, 'thisismysecretkey', { expiresIn: '1h' });
    user.token = newToken;
    await user.save();
    return newToken;
}

exports.authenticateJWT = async (req, res, next) => {
    // const token = req.header('Authorization');
    const userId = req.body.user._id;
    let token = null;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'User not found. Authentication failed.'
            });
        }

        token = user.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'No token found. Authentication failed.'
            });                
        }
        //got the token
        const decodedToken = jwt.verify(token, 'thisismysecretkey');
        const decoded_userId = decodedToken.userId;
        const auth_token = await User.findById(decoded_userId);

        if (!auth_token) {
            return res.status(401).json({
              success: false,
              status: 401,
              message: 'User not found. Authentication failed.'
            });
        }
        const newToken = await refreshToken(auth_token);
        user.token = newToken;
        req.user = user; // Update the user with the latest token
        next();

        // jwt.verify(token, 'thisismysecretkey', (err, decoded) => {
        //     if (err) {
        //         return res.status(401).json({
        //             success: false,
        //             status: 401,
        //             message: 'Invalid token. Authentication failed.'
        //         });
        //     }
        //     req.user = user;
        //     next();
        // });

    } catch (error) {
        try {
            const decodedToken = jwt.verify(token, 'thisismysecretkey', { ignoreExpiration: true });
            const userId = decodedToken.userId;
        
            const user = await User.findById(userId);
        
            if (!user) {
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: 'User not found. Authentication failed.'
                });
            }
        
            const newToken = await refreshToken(user);
            // res.set('Authorization', newToken); // Return the new token to the client
            user.token = newToken;
            req.user = user; // Update the request user object with the latest user data
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Invalid token. Authentication failed.'
            });
        }
        // return res.status(401).json({
        //     success: false,
        //     status: 401,
        //     message: 'Invalid token. Authentication failed.'
        // });
    }
}

exports.refreshJWT = async (req, res, next) => {
    const userId = req.body.user._id;
  
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'User not found. Authentication failed.'
            });
        }

        const token = user.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'No token found. Authentication failed.'
            });
        }
        //got the token

        const decodedToken = jwt.verify(token, 'thisismysecretkey');
        const decoded_userId = decodedToken.userId;

        const auth_user = await User.findById(decoded_userId);
        if (!auth_user) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'User not found. Authentication failed.'
            });
        }

        const tokenExpiration = decodedToken.exp * 1000;
        const currentTime = new Date().getTime();
        const timeToRefresh = 5 * 60 * 1000;

        if (tokenExpiration - currentTime <= timeToRefresh) {
            const newToken = await refreshToken(user);
            user.token = newToken;
        }

        next();

        // jwt.verify(token, 'thisismysecretkey', async (err, decoded) => {
        //     if (err) {
        //         return res.status(401).json({
        //             success: false,
        //             status: 401,
        //             message: 'Invalid token. Authentication failed.'
        //         });
        //     }

        //     const tokenExpiration = decoded.exp * 1000;
        //     const currentTime = new Date().getTime();
        //     const timeToRefresh = 5 * 60 * 1000;

        //     if (tokenExpiration - currentTime <= timeToRefresh) {
        //         const newToken = jwt.sign({ userId: user._id }, 'thisismysecretkey', { expiresIn: '1h' });
        //         user.token = newToken;
        //         await user.save();
        //     }

        //     next();
        // });
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            status: 401,
            message: 'Invalid token. Authentication failed.'
        });
    }
}
