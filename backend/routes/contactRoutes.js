// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/contactModel');
const { protect } = require('../middleware/authMiddleware');

// Delete a contact
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await contact.remove();
    res.json({ message: 'Contact removed' });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
