import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

function EditContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useContext(ToastContext);

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    phoneNumbers: [""],
    profilePicture: null,
  });

  const [originalDetails, setOriginalDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/contact/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setUserDetails(result);
          setOriginalDetails(result);
        } else {
          toast.error(result.error);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load contact details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

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
      const updatedPhoneNumbers = userDetails.phoneNumbers.filter(
        (_, i) => i !== index
      );
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
    
    const phoneNumbers = userDetails.phoneNumbers.map((phone) => phone.trim());
    const uniquePhoneNumbers = [...new Set(phoneNumbers)];

    if (uniquePhoneNumbers.length !== phoneNumbers.length) {
      toast.error("Duplicate phone numbers are not allowed.");
      return;
    }

    
    const phonePattern = /^[0-9]{10}$/;
    for (const phone of uniquePhoneNumbers) {
      if (!phonePattern.test(phone)) {
        toast.error(`Invalid phone number: ${phone}`);
        return;
      }
    }

    
    const hasChanges =
      userDetails.firstName !== originalDetails.firstName ||
      userDetails.lastName !== originalDetails.lastName ||
      userDetails.company !== originalDetails.company ||
      userDetails.address !== originalDetails.address ||
      userDetails.profilePicture !== originalDetails.profilePicture ||
      userDetails.phoneNumbers.length !== originalDetails.phoneNumbers.length ||
      userDetails.phoneNumbers.some(
        (phone, index) => phone !== originalDetails.phoneNumbers[index]
      );

    if (!hasChanges) {
      toast.info("No changes detected.");
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
      const res = await fetch(`http://localhost:8000/api/contact/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Contact updated successfully.");
        navigate("/mycontacts", { replace: true });
      } else {
        toast.error(result.error || "Failed to update contact.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update contact.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <h1>Edit Contact</h1>
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
          Update Contact
        </button>
      </form>
    </div>
  );
}

export default EditContact;
