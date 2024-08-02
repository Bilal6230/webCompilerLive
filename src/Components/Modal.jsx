import React from 'react';
import './modalStyles.css'; // Make sure this path is correct

const Modal = ({ show, handleClose, children }) => {
  return (
    <div className={`mdc-dialog ${show ? 'mdc-dialog--open' : ''}`} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-content">
      <div className="mdc-dialog__container">
        <div className="mdc-dialog__surface modal-large">
          <h2 className="mdc-dialog__title" id="dialog-title">Challenge solution</h2>
          <div className="app-modal-top-right"></div>
          <div className="mdc-dialog__content">
            <div className="data-mdc-dialog-initial-focus"></div>
            <div id="dialog-content">{children}</div>
          </div>
          <footer className="mdc-dialog__actions">
            <button className="app-button dimmed" onClick={handleClose} data-mdc-dialog-action="dismiss">
              Dismiss
            </button>
          </footer>
        </div>
      </div>
      <div className="mdc-dialog__scrim" onClick={handleClose}></div>
    </div>
  );
};

export default Modal;
