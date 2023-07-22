const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    present: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    schedule: [{
        day: {
            type: String,
            enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        }
    }],
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;