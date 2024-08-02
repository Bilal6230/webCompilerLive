import React, { useState } from 'react';
import { MdVisibility } from "react-icons/md";
import Modal from "./Modal";

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
          padding: "8px",
          borderRadius: "6px",
          outline: "none",
          border: "none",
          marginRight: "10px",
        }}
        
        className="solution-button"
        id="view-solution"
      >
        <MdVisibility style={{ marginRight: "5px" }} />
        Solution
      </button>
      <Modal show={showModal} handleClose={handleClose}>
        {/* Add your modal content here */}
        <p>This is the solution content</p>
      </Modal>
    </div>
  );
};

export default SolutionButton;
