import React, { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  
  console.log('Profile Picture Path:', user ? user.profilePicture : 'No user');

  const profilePicturePath = user && user.profilePicture
    ? user.profilePicture.replace(/\\/g, '/') 
    : "";
  const profilePictureUrl = profilePicturePath
    ? `http://localhost:8000/uploads/${profilePicturePath.split('/').pop()}`
    : "";

  return (
    <>
      <div className="jumbotron">
        <h1>
          Welcome {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
        </h1>
        {user && profilePictureUrl && (
          <img
            src={profilePictureUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="img-thumbnail"
            style={{ width: "150px", height: "150px", borderRadius: "50%" }}
          />
        )}
        <hr className="my-4" />
        <Link to="/create" className="btn btn-primary">
          Create Contact
        </Link>
        &nbsp;&nbsp;
        <Link to="/mycontacts" className="btn btn-primary">
          My Contacts
        </Link>
      </div>
    </>
  );
}

export default Home;
