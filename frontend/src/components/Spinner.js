import React from "react";

const Spinner = ({ splash = "Loading..." }) => {
  return (
    <div className="text-center mt-5">
      <div
        className="spinner-border m-5"
        role="status"
        style={{ width: "2rem", height: "2rem" }}
      >
        <span className="sr-only"></span>
      </div>
      <h3>{splash}</h3>
    </div>
  );
};

export default Spinner;
