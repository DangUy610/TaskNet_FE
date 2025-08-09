import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './SwitchAccountsModal.css';
import { AuthContext } from '../../contexts/AuthContext';

export default function SwitchAccountsModal({ onSwitch, onClose }) {
  const [accounts, setAccounts] = useState([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedAccounts')) || [];
    setAccounts(stored);
  }, []);

  const handleDelete = (emailToRemove) => {
    const updated = accounts.filter(acc => acc.email !== emailToRemove);
    localStorage.setItem('savedAccounts', JSON.stringify(updated));
    setAccounts(updated);
  };

  const handleSwitch = (acc) => {
    onSwitch(acc);
    onClose();
  };

  const handleLogout = () => {
    if(logout){
      logout().then(() => {
        onClose();
        navigate('/login');
      });
    }
  }

  return (
    <div className="switch-account-overlay" onClick={onClose}>
      <div className="switch-account-box" onClick={(e) => e.stopPropagation()}>
        <h5>TaskNest</h5>
        <p className="subtitle">Choose or add another account</p>

        {accounts.length === 0 ? (
          <p className="text-muted">No saved accounts.</p>
        ) : (
          <div className="account-list">
            {accounts.map((acc, i) => (
              <div key={i} className="account-item">
                <img src={acc.avatar} alt={acc.email} />
                <div>
                  <strong>{acc.name}</strong>
                  <div className="text-muted">{acc.email}</div>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(acc.email)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <button className="add-account-btn" onClick={() => { onClose(); navigate('/login'); }}>
          Add another account
        </button>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
        <div className="atlassian-footer">
          <span>▲ ATLASSIAN</span><br />
          <a href="#">One account for Tasknest, Jira, Confluence and more</a>
        </div>
      </div>
    </div>
  );
}