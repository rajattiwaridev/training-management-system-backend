// listeners/trainingListeners.js
const trainingEmitter = require('../emitter/eventEmitter');
const Training = require('../models/Training'); // Adjust path as needed
// const notificationService = require('../services/notificationService'); // Your notification service

trainingEmitter.on('trainingCompleted', async (trainingId) => {
  try {
    console.log(`Processing trainingCompleted event for training ID: ${trainingId}`);
    // const training = await Training.findById(trainingId).populate('attendees');
    // if (!training) {
    //   console.error(`Training not found: ${trainingId}`);
    //   return;
    // }
    
    // // Send notifications to all attendees
    // for (const user of training.attendees) {
    //   try {
    //     await notificationService.sendTrainingCompletion(user, training);
    //     console.log(`Notification sent to ${user.email}`);
    //   } catch (error) {
    //     console.error(`Failed to notify ${user.email}:`, error);
    //   }
    // }
  } catch (error) {
    console.error('Error processing trainingCompleted event:', error);
  }
});