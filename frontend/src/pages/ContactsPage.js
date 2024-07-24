// src/pages/ContactPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContactList from '../components/ContactList';
import AddContactForm from '../components/AddContactForm';

const ContactPage = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const { data } = await axios.get('/api/contacts', config);
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error.response.data.message);
      }
    };

    fetchContacts();
  }, []);

  const handleContactAdded = (newContact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  const handleDeleteContact = (contactId) => {
    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact._id !== contactId)
    );
  };

  return (
    <div>
      <h1>Contact List</h1>
      <AddContactForm onContactAdded={handleContactAdded} />
      <ContactList contacts={contacts} onDelete={handleDeleteContact} />
    </div>
  );
};

export default ContactPage;
