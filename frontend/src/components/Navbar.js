import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

const Navbar = ({ title = "Contactflix" }) => {
  const navigate = useNavigate();

  const { toast } = useContext(ToastContext);
  const { user, setUser } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand ms-3">
          {title}
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarColor01"
          aria-controls="navbarColor01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarColor01">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/mycontacts" className="nav-link">
                    My Contacts
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/create" className="nav-link">
                    create contact
                  </NavLink>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setUser(null);
                      localStorage.clear();
                      toast.success("Logged out");
                      navigate("/login", { replace: true });
                    }}
                  >
                    LOGOUT
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
