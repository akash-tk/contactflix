// backend/controllers/contactController.js
const Contact = require('../models/contactModel');

// Get all contacts for a user
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user.id });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new contact
exports.createContact = async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        const newContact = new Contact({ user: req.user.id, name, email, phone });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a contact
exports.updateContact = async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        contact.name = name || contact.name;
        contact.email = email || contact.email;
        contact.phone = phone || contact.phone;

        await contact.save();
        res.json(contact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a contact
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await contact.remove();
        res.json({ message: 'Contact removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
