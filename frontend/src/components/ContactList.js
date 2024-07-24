// src/components/ContactList.js
import React from 'react';
import axios from 'axios';

const ContactList = ({ contacts, onDelete }) => {
  const handleDeleteContact = async (contactId) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/contacts/${contactId}`, config);
      onDelete(contactId);
    } catch (error) {
      console.error('Error deleting contact:', error.response.data.message);
      alert('Failed to delete contact. Please try again.');
    }
  };

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact._id}>
          <span>{contact.name}</span>
          <span>{contact.email}</span>
          <span>{contact.phone}</span>
          <button onClick={() => handleDeleteContact(contact._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default ContactList;
