import React, { useState } from 'react';
import { MdVisibility } from "react-icons/md";
import Modal from "./Modal";  // Ensure the Modal component is correctly imported

const SolutionButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div>
      <button
        style={{
          backgroundColor: "#424242",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          outline: "none",
          border: "none",
          marginRight: "10px",
          fontSize: "14px",
        }}
        className="solution-button"
        id="view-solution"
        onClick={handleOpen}
      >
        <MdVisibility style={{ marginRight: "5px" }} />
        Solution
      </button>
      <Modal show={showModal} handleClose={handleClose}>
        <p>This is the solution content show here that comes from backend</p>
      </Modal>
    </div>
  );
};

export default SolutionButton;
