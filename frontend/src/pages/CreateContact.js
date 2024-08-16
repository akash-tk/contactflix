import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

function CreateContact() {
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    phoneNumbers: [""],
    profilePicture: null,
  });

  const { toast } = useContext(ToastContext);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture") {
      setUserDetails({
        ...userDetails,
        profilePicture: files ? files[0] : null,
      });
    } else if (name.startsWith("phone")) {
      const updatedPhoneNumbers = [...userDetails.phoneNumbers];
      updatedPhoneNumbers[index] = value;
      setUserDetails({
        ...userDetails,
        phoneNumbers: updatedPhoneNumbers,
      });
    } else {
      setUserDetails({
        ...userDetails,
        [name]: value,
      });
    }
  };

  const handleAddPhoneNumber = () => {
    setUserDetails({
      ...userDetails,
      phoneNumbers: [...userDetails.phoneNumbers, ""],
    });
  };

  const handleRemovePhoneNumber = (index) => {
    if (userDetails.phoneNumbers.length > 1) {
      const updatedPhoneNumbers = userDetails.phoneNumbers.filter((_, i) => i !== index);
      setUserDetails({
        ...userDetails,
        phoneNumbers: updatedPhoneNumbers,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const namePattern = /^[a-zA-Z\s]+$/;
  if (!namePattern.test(userDetails.firstName)) {
    toast.error("First name can only contain alphabetic characters and spaces.");
    return;
  }
  if (!namePattern.test(userDetails.lastName)) {
    toast.error("Last name can only contain alphabetic characters and spaces.");
    return;
  }

    
    const phoneNumbers = userDetails.phoneNumbers.map(phone => phone.trim());
    const uniquePhoneNumbers = [...new Set(phoneNumbers)];

    if (uniquePhoneNumbers.length !== phoneNumbers.length) {
      toast.error("Duplicate phone numbers are not allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", userDetails.firstName);
    formData.append("lastName", userDetails.lastName);
    formData.append("company", userDetails.company);
    formData.append("address", userDetails.address);
    uniquePhoneNumbers.forEach((phone, index) =>
      formData.append(`phoneNumbers[${index}]`, phone)
    );
    if (userDetails.profilePicture) {
      formData.append("profilePicture", userDetails.profilePicture);
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/contact`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("Contact created successfully");

        setUserDetails({
          firstName: "",
          lastName: "",
          company: "",
          address: "",
          phoneNumbers: [""],
          profilePicture: null,
        });

        navigate("/mycontacts");
      } else {
        toast.error(result.error || "An error occurred while creating the contact.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the contact.");
    }
  };

  return (
    <div className="container">
      <h1>Create Contact</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            className="form-control"
            id="firstName"
            value={userDetails.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            className="form-control"
            id="lastName"
            value={userDetails.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="company" className="form-label">
            Company
          </label>
          <input
            type="text"
            name="company"
            className="form-control"
            id="company"
            value={userDetails.company}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <input
            type="text"
            name="address"
            className="form-control"
            id="address"
            value={userDetails.address}
            onChange={handleChange}
            required
          />
        </div>

        {userDetails.phoneNumbers.map((phone, index) => (
          <div key={index} className="mb-3">
            <label htmlFor={`phone-${index}`} className="form-label">
              Phone {index + 1}
            </label>
            <input
              type="text"
              name={`phone-${index}`}
              className="form-control"
              id={`phone-${index}`}
              value={phone}
              onChange={(e) => handleChange(e, index)}
              required
            />
            {index > 0 && (
              <button
                type="button"
                className="btn btn-danger mt-2"
                onClick={() => handleRemovePhoneNumber(index)}
              >
                Remove Phone Number
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={handleAddPhoneNumber}
        >
          Add Another Phone Number
        </button>

        <div className="mb-3">
          <label htmlFor="profilePicture" className="form-label">
            Profile Picture
          </label>
          <input
            type="file"
            name="profilePicture"
            className="form-control"
            id="profilePicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Contact
        </button>
      </form>
    </div>
  );
}

export default CreateContact;
