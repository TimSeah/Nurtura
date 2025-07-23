const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

//DEPRECATED, NO LONGER USING AUTH
//import auth from @clerk/express
//const {requireAuth} = require('@clerk/express'); 

// Applies authentication check to entire router
// from this line onwards, all routes in this file require user
// to be authenticated
//router.use(requireAuth());


// Get all alerts for a recipient
router.get('/:recipientId', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { isRead, priority, type } = req.query;
    
    let filter = { recipientId };
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    if (priority) {
      filter.priority = priority;
    }
    if (type) {
      filter.type = type;
    }
    
    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get alert counts/statistics
router.get('/:recipientId/stats', async (req, res) => {
  try {
    const { recipientId } = req.params;
    
    const stats = await Alert.aggregate([
      { $match: { recipientId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          },
          highPriority: {
            $sum: {
              $cond: [{ $in: ['$priority', ['high', 'critical']] }, 1, 0]
            }
          },
          actionRequired: {
            $sum: {
              $cond: [{ $eq: ['$actionRequired', true] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    res.json(stats[0] || { total: 0, unread: 0, highPriority: 0, actionRequired: 0 });
  } catch (err) {
    console.error('Error fetching alert stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const alert = new Alert(req.body);
    const savedAlert = await alert.save();
    res.status(201).json(savedAlert);
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(400).json({ message: err.message });
  }
});

// Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!updatedAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(updatedAlert);
  } catch (err) {
    console.error('Error marking alert as read:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark alert as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { isResolved: true, isRead: true },
      { new: true }
    );
    if (!updatedAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(updatedAlert);
  } catch (err) {
    console.error('Error resolving alert:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAlert = await Alert.findByIdAndDelete(id);
    if (!deletedAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    console.error('Error deleting alert:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all alerts as read for a recipient
router.patch('/:recipientId/mark-all-read', async (req, res) => {
  try {
    const { recipientId } = req.params;
    await Alert.updateMany(
      { recipientId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    console.error('Error marking all alerts as read:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
