const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require('jsonwebtoken');
var fs = require('fs');
const cron = require('node-cron');
const admin = require('firebase-admin');
const serviceAccount = require('./utils/keyFile.json'); // Update the path to your serviceAccountKey
const accountSid = 'AC2c1545a2a27962775cce5bf2648d2bb3';
const authToken = '5e469ade29e1d4bd51fb59af644ca443';
const client = require('twilio')(accountSid, authToken);

//route imports
const userRouter = require('./routes/user.route');
const subjectRouter = require('./routes/subject.route');
const Subject = require('./model/subject.model');
const User = require('./model/user.model');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(express.urlencoded({ extended: true }));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const port = process.env.PORT

mongoose.connect(process.env.DB_URL);
const connection = mongoose.connection;

app.listen(port, () => {
    connection.once('open', () => {
        console.log(`Server started at ${port}, MongoDB connected Successfully`);
    });
});

app.get("/", (req, res) => {
    res.json("It's Working");
})

// END POINTS
app.use('/api/user', userRouter);
app.use('/api/subject', subjectRouter);

const notifyUser = async () => {
    client.messages
        .create({
            from: '+12295972429',
            to: "+917099485845",
            body: "Test message for SMS testing",
        })
        .then((message) => {
            console.log('SMS sent:', message.sid);
        })
        .catch((error) => {
            console.error('Error sending SMS:', error);
        });
}

cron.schedule('0 0 * * *', async () => {
    try {
        // Reset the 'notificationSent' status to 'false' for all subjects
        await Subject.updateMany({}, { $set: { "schedule.$[].notificationSent": false } }, { new: true });
        console.log('Notification status reset for all subjects.');
    } catch (err) {
        console.error('Error resetting notification status:', err);
    }
});

cron.schedule('* * * * * *', async () => {
    try {
        // Get the current date and time
        const now = new Date();
    
        // Get all subjects from MongoDB that have not been notified on the current day
        const subjects = await Subject.find({ "schedule.notificationSent": false }).exec();
    
        // Send push notifications to clients for each subject
        subjects.forEach(async (subject) => {
            // Filter schedules that are within 1 hour of the current time and have notificationSent as false
            const schedulesToNotify = subject.schedule.filter((schedule) => {
                if(!schedule.notificationSent){
                    const differenceInMilliseconds = schedule.startTime - now;
                    return differenceInMilliseconds <= 3600000 && differenceInMilliseconds > 0 && !schedule.notificationSent;
                } else {
                    return false;
                }
            });
      
            // Send push notifications to clients for each schedule
            schedulesToNotify.forEach(async (schedule) => {
                try {
                    // Get the user_id associated with the subject (assuming there's a User model)
                    const user = await User.findById(subject.user_id).exec();
        
                    if (user) {
                        // Send the push notification using FCM
                        const notification = `Upcoming Class - Your class "${subject.name}" on ${schedule.day} at ${schedule.startTime.toLocaleString()} is starting soon!`
                        // await notifyUser(notification);
                        console.log(notification);
                    } else {
                        console.log(`User not found for id: ${subject.user_id}`);
                    }
        
                    // Mark the schedule as notified in the database
                    schedule.notificationSent = true;
                    await subject.save();
                } catch (err) {
                    console.error('Error sending push notification:', err);
                }
            });
        });
    } catch (err) {
        console.error('Error checking classes:', err);
    }
});