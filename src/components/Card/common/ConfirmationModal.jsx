
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmationModal({
  show,
  onClose,
  onConfirm,
  title,
  body,
  confirmVariant = 'danger',
  confirmText = 'Delete',
}) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirm Action'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {body || 'Are you sure you want to proceed? This action cannot be undone.'}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}