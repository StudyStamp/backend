const Subject = require('../model/subject.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require("dotenv").config();

exports.create = async (req, res) => {
    const { name, user_id, present, total, schedule } = req.body;
  
    try {
        const newSubject = new Subject({
            name,
            user_id,
            present,
            total,
            schedule
        });
    
        const savedSubject = await newSubject.save();
        res.status(201).json({
            success: true,
            type: "success",
            status: 201,
            message: 'Subject created with schedule successfully!',
            subject: savedSubject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while creating the subject.',
            error: error.message
        });
    }
};

exports.getSubjectsByUserId = async (req, res) => {
    const userId = req.body.user._id;
  
    try {
        const subjects = await Subject.find({ user_id: userId });
    
        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                type: "warning",
                status: 404,
                message: 'No subjects found for this user ID.'
            });
        }
    
        res.status(200).json({
            success: true,
            type: "success",
            status: 200,
            message: 'Subjects retrieved successfully!',
            subjects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while fetching the subjects.',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    const { _id, name, user_id, present, total, schedule } = req.body;
  
    try {
        const updatedSubject = await Subject.findByIdAndUpdate(
            _id,
            {
                name,
                user_id,
                present,
                total,
                schedule
            },
            { new: true }
        );
  
        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                type: "warning",
                status: 404,
                message: 'Subject not found.'
            });
        }
  
        res.status(200).json({
            success: true,
            type: "success",
            status: 200,
            message: 'Subject updated successfully!',
            subject: updatedSubject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while updating the subject.',
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    const subjectId = req.body._id; // Assuming the subjectId is passed as a parameter in the URL
  
    try {
        const deletedSubject = await Subject.findByIdAndDelete(subjectId);
    
        if (!deletedSubject) {
            return res.status(404).json({
                success: false,
                type: "warning",
                status: 404,
                message: 'Subject not found.'
            });
        }
  
        res.status(200).json({
            success: true,
            type: "success",
            status: 200,
            message: 'Subject deleted successfully!',
            subject: deletedSubject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            type: "error",
            status: 500,
            message: 'An error occurred while deleting the subject.',
            error: error.message
        });
    }
};