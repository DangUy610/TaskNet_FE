
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as workspaceApi from '../../api/workspaceApi';

export default function CreateWorkspaceModal({ onCreate, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await workspaceApi.createWorkspace({ name });
      onCreate(res.data);
      toast.success('Workspace created successfully!');
    } catch (err) {
      console.error('Error creating workspace:', err);
      toast.error('Failed to create workspace. Please try again.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>New Workspace</h2>
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
