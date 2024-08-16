import React, { useContext, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ToastContext from "../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";

function AllContacts() {
  const navigate = useNavigate();
  const { toast } = useContext(ToastContext);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const contactsPerPage = 4;

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/mycontacts?page=${currentPage}&limit=${contactsPerPage}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setContacts(result.contacts || []);
          setTotalPages(result.totalPages || 1);
          setTotalContacts(result.totalContacts || 0); 

          
          if (currentPage > 1 && result.contacts.length === 0) {
            setCurrentPage(1);
          }
        } else {
          toast.error(result.error);
        }
      } catch (err) {
        console.log(err);
        toast.error("An error occurred while fetching contacts.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentPage, toast]);

  const deleteContact = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/delete/${modalData._id}?page=${currentPage}&limit=${contactsPerPage}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result = await res.json();
      if (!result.error) {
        setContacts(result.contacts || []);
        setTotalPages(result.totalPages || 1);
        setTotalContacts(result.totalContacts || 0);

        
        if (result.totalContacts <= (currentPage - 1) * contactsPerPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (result.totalContacts === 0) {
          setCurrentPage(1);
        }

        setShowConfirmModal(false);
        setShowModal(false);
        toast.success(
          `${modalData.firstName} ${modalData.lastName} contact deleted successfully`
        );
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occurred while deleting the contact.");
      setShowConfirmModal(false);
    }
  };

  
  const filteredContacts = contacts.filter((item) => {
    return searchInput.toLowerCase() === ""
      ? item
      : item.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchInput.toLowerCase());
  });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div>
        <h1>Your Contacts</h1>
        <hr className="my-4" />
        {loading ? (
          <Spinner splash="Loading Contacts..." />
        ) : (
          <>
            {totalContacts === 0 ? (
              <>
                <h3>No Contacts Here to Show</h3>{" "}
                <a
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate("/create", { replace: true })}
                >
                  Create new contact
                </a>
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="searchInput"
                  id="searchInput"
                  className="form-control my-3"
                  placeholder="Search Contact"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <p>Total Contacts: {totalContacts}</p>
                <div className="table-responsive col-lg-12">
                  <table className="table table-light table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col">Profile</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">Address</th>
                        <th scope="col">Company</th>
                        <th scope="col">Phone</th>
                      </tr>
                    </thead>
                    <tbody style={{ cursor: "pointer" }}>
                      {filteredContacts.map((person) => (
                        <tr
                          key={person._id}
                          onClick={() => {
                            setModalData(person);
                            setShowModal(true);
                          }}
                        >
                          <td>
                            {person.profilePicture ? (
                              <img
                                src={`http://localhost:8000/${person.profilePicture}`}
                                alt={`${person.firstName} ${person.lastName}`}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  backgroundColor: "#e0e0e0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "20px",
                                }}
                              >
                                {person.firstName
                                  ? person.firstName.charAt(0)
                                  : "?"}
                              </div>
                            )}
                          </td>
                          <th scope="row">{person.firstName}</th>
                          <td>{person.lastName}</td>
                          <td>{person.address}</td>
                          <td>{person.company}</td>
                          <td>
                            {Array.isArray(person.phoneNumbers) &&
                            person.phoneNumbers.length > 0
                              ? person.phoneNumbers.map((phone, idx) => (
                                  <span key={idx}>
                                    {phone}
                                    {idx < person.phoneNumbers.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                ))
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </>
            )}
          </>
        )}
      </div>

      {/* Contact Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalData.firstName} {modalData.lastName}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="text-center">
            {modalData.profilePicture ? (
              <img
                src={`http://localhost:8000/${modalData.profilePicture}`}
                alt={`${modalData.firstName} ${modalData.lastName}`}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  backgroundColor: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "60px",
                  color: "#757575",
                }}
              >
                {modalData.firstName ? modalData.firstName.charAt(0) : "?"}
              </div>
            )}
          </div>
          <p>
            <strong>Address: </strong>
            {modalData.address}
          </p>
          <p>
            <strong>Company: </strong>
            {modalData.company}
          </p>
          <p>
            <strong>Phone No: </strong>
            {Array.isArray(modalData.phoneNumbers) &&
            modalData.phoneNumbers.length > 0
              ? modalData.phoneNumbers.map((phone, idx) => (
                  <span key={idx}>
                    {phone}
                    {idx < modalData.phoneNumbers.length - 1 ? ", " : ""}
                  </span>
                ))
              : "N/A"}
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Link className="btn btn-info" to={`/edit/${modalData._id}`}>
            Edit
          </Link>
          <Button variant="danger" onClick={() => setShowConfirmModal(true)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {modalData.firstName}{" "}
          {modalData.lastName}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              deleteContact().then(() => {
                if (totalContacts <= contactsPerPage) {
                  setCurrentPage(1);
                }
              });
            }}
          >
            Confirm
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AllContacts;
