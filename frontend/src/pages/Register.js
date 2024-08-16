import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

function Register() {
  const { toast } = useContext(ToastContext);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    phoneNumbers: [""],
    address: "",
    profilePicture: null,
  });

  const handleInputChange = (event) => {
    const { name, value, dataset } = event.target;
    if (name === "phoneNumbers") {
      const index = parseInt(dataset.index);
      const updatedPhoneNumbers = [...credentials.phoneNumbers];
      updatedPhoneNumbers[index] = value;
      setCredentials({ ...credentials, phoneNumbers: updatedPhoneNumbers });
    } else {
      setCredentials({ ...credentials, [name]: value });
    }
  };

  const handleAddPhoneNumber = () => {
    setCredentials({
      ...credentials,
      phoneNumbers: [...credentials.phoneNumbers, ""],
    });
  };

  const handleRemovePhoneNumber = (index) => {
    const updatedPhoneNumbers = credentials.phoneNumbers.filter(
      (_, i) => i !== index
    );
    setCredentials({ ...credentials, phoneNumbers: updatedPhoneNumbers });
  };

  const handleFileChange = (event) => {
    setCredentials({ ...credentials, profilePicture: event.target.files[0] });
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/; 
    return phoneRegex.test(phoneNumber);
  };

  const isValidName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/; 
    return nameRegex.test(name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !credentials.firstName ||
      !credentials.lastName ||
      !credentials.email ||
      !credentials.password ||
      !credentials.confirmPassword ||
      !credentials.dateOfBirth ||
      !credentials.gender ||
      !credentials.phoneNumbers.length ||
      !credentials.address
    ) {
      toast.error("Please enter all the required fields");
      return;
    }

    if (!isValidName(credentials.firstName)) {
      toast.error("First name should contain only alphabetic characters and spaces.");
      return;
    }

    if (!isValidName(credentials.lastName)) {
      toast.error("Last name should contain only alphabetic characters and spaces.");
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    
    const phoneSet = new Set(credentials.phoneNumbers);
    if (phoneSet.size !== credentials.phoneNumbers.length) {
      toast.error("Duplicate phone numbers are not allowed");
      return;
    }

    
    for (let phoneNumber of credentials.phoneNumbers) {
      if (!isValidPhoneNumber(phoneNumber)) {
        toast.error(`Invalid phone number: ${phoneNumber}`);
        return;
      }
    }

    const formData = new FormData();
    formData.append("phoneNumbers", JSON.stringify(credentials.phoneNumbers));

    for (const key in credentials) {
      if (key !== "phoneNumbers") {
        if (credentials[key] instanceof File) {
          formData.append(key, credentials[key]);
        } else {
          formData.append(key, credentials[key]);
        }
      }
    }

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!result.error) {
        localStorage.setItem("token", result.token);
        setUser(result.user);
        toast.success("User registered and logged in successfully");
        navigate("/", { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.log("Registration failed", error);
      toast.error("Registration failed");
    }
  };

  return (
    <>
      <h3>CREATE YOUR ACCOUNT</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName" className="form-label mt-4">
            First Name
          </label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            name="firstName"
            value={credentials.firstName}
            onChange={handleInputChange}
            placeholder="Enter First Name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName" className="form-label mt-4">
            Last Name
          </label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            name="lastName"
            value={credentials.lastName}
            onChange={handleInputChange}
            placeholder="Enter Last Name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label mt-4">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            placeholder="Enter Email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label mt-4">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            placeholder="Enter Password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label mt-4">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={credentials.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth" className="form-label mt-4">
            Date of Birth
          </label>
          <input
            type="date"
            className="form-control"
            id="dateOfBirth"
            name="dateOfBirth"
            value={credentials.dateOfBirth}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender" className="form-label mt-4">
            Gender
          </label>
          <select
            className="form-control"
            id="gender"
            name="gender"
            value={credentials.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {credentials.phoneNumbers.map((phoneNumber, index) => (
          <div key={index} className="form-group">
            <label
              htmlFor={`phoneNumberInput${index}`}
              className="form-label mt-4"
            >
              Phone Number {index + 1}
            </label>
            <input
              type="text"
              className="form-control"
              id={`phoneNumberInput${index}`}
              name="phoneNumbers"
              data-index={index}
              value={phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter Phone Number"
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
          className="btn btn-secondary mt-4"
          onClick={handleAddPhoneNumber}
        >
          Add Another Phone Number
        </button>
        <div className="form-group">
          <label htmlFor="address" className="form-label mt-4">
            Address
          </label>
          <input
            type="text"
            className="form-control"
            id="address"
            name="address"
            value={credentials.address}
            onChange={handleInputChange}
            placeholder="Enter Address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="profilePicture" className="form-label mt-4">
            Profile Picture
          </label>
          <input
            type="file"
            className="form-control"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Register
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <NavLink to="/login">Login</NavLink>
      </p>
    </>
  );
}

export default Register;
