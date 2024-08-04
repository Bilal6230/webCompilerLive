import React from 'react';
import '@material/dialog/dist/mdc.dialog.css'; // Ensure this path is correct
import './Modal.css'; // Import custom styles

const Modal = ({ show, handleClose, children }) => {
  if (!show) return null;

  return (
    <div
      id="modal"
      className="mdc-dialog mdc-dialog--open fullscreen-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-content"
    >
      <div className="mdc-dialog__container fullscreen-container">
        <div
          tabIndex="0"
          aria-hidden="true"
          className="mdc-dom-focus-sentinel"
        ></div>
        <div className="mdc-dialog__surface fullscreen-surface">
          <h2 className="mdc-dialog__title" id="dialog-title">
            Challenge solution
          </h2>
          <div className="app-modal-top-right">
            <slot name="top-right"></slot>
          </div>
          <div className="mdc-dialog__content">
            <div
              tabIndex="0"
              className="data-mdc-dialog-initial-focus"
            ></div>
            <div id="dialog-content">
              {children}
            </div>
          </div>
          <footer className="mdc-dialog__actions">
            <slot name="buttons">
              <button
                className="mdc-button"
                data-mdc-dialog-action="dismiss"
                onClick={handleClose}
              >
                Dismiss
              </button>
            </slot>
          </footer>
        </div>
        <div
          tabIndex="0"
          aria-hidden="true"
          className="mdc-dom-focus-sentinel"
        ></div>
      </div>
      <div className="mdc-dialog__scrim" onClick={handleClose}></div>
    </div>
  );
};

export default Modal;
