const User = require('../model/user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtAuth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require("dotenv").config();

exports.get = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            type: "success",
            status: 200,
            message: 'All users fetched successfully.',
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while processing your request.' 
        });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({
                success: false,
                type: "warning",
                status: 401,
                message: 'Invalid credentials. Please try again.'
            });
        } else {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                res.status(401).json({
                    success: false,
                    type: "warning",
                    status: 401,
                    message: 'Invalid credentials. Please try again.'
                });
            } else {
                const token = await generateToken(user);
                
                user.token = token;
                await user.save();
                
                res.status(200).json({
                    success: true,
                    type: "success",
                    status: 200,
                    message: 'Login successful!',
                    user
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while processing your request.' 
        });
    }
}

exports.register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                type: "warning",
                status: 409,
                message: 'User with this email already exists.'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user record
        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        // Save the new user to the database
        await newUser.save();

        // Return a success message
        return res.status(201).json({
            success: true,
            type: "success",
            status: 201,
            message: 'User registered successfully!',
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while processing your request.'
        });
    }
}

exports.update = async (req, res) => {
    const { id } = req.params; // Assuming the user ID is passed as a parameter in the request URL
    const updateFields = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                type: "warning",
                status: 404,
                message: 'User not found.'
            });       
        }

        Object.keys(updateFields).forEach((field) => {
            user[field] = updateFields[field];
        });
        await user.save();

        return res.status(200).json({
            success: true,
            type: "success",
            status: 200,
            message: 'User updated successfully!',
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while processing your request.'
        });
    }
}

exports.forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
      // Find the user in the database by their email
        const user = await User.findOne({ email });
    
        if (!user) {
            return res.status(404).json({
                success: false,
                type: "warning",
                status: 404,
                message: 'User not found.'
            });
        }
    
        // Generate a unique password reset token using crypto
        const token = crypto.randomBytes(20).toString('hex');
    
        // Store the token and its expiration time in the user's database record
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    
        // Save the user with the updated token and expiration time
        await user.save();
    
        // Compose the email with the password reset link
        const resetURL = `http://your-frontend-url/reset-password?token=${token}`;
        const message = `You have successfully requested the reset of the password for your account. Please click on the following link to complete the process: <a href=${resetURL} target="_blank">Click here</a>\n\n
        If you requested by mistake, please ignore this message and your password will remain unchanged.`;

        return res.status(500).json({
            success: true,
            type: "success",
            status: 200,
            message: message
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while processing your request.'
        });
    }
}

exports.reset_password = async (req, res) => {
    const { token } = req.params; // Assuming the token is passed as a parameter in the request URL
    const { newPassword } = req.body;
  
    try {
        // Find the user in the database by the password reset token and check if it's still valid
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check if the token's expiration time is greater than the current time
        });
    
        if (!user) {
            return res.status(400).json({
                success: false,
                type: "warning",
                status: 400,
                message: 'Password reset token is invalid or has expired.'
            });
        }
    
        // Hash the new password before saving it to the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Update the user's password and reset token fields in the database
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
    
        // Save the user with the updated password and reset token fields
        await user.save();
    
        return res.status(200).json({
            success: true,
            type: "success",
            status: 200,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while processing your request.'
        });
    }
}