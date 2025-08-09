import React, { useContext } from 'react';
import { Dropdown, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ModalContext } from '../contexts/ModalContext';
import { AuthContext } from '../contexts/AuthContext';
import { getUserMenuConfig } from '../features/boards/userMenuConfig';
import '../styles/App.css';

export default function UserDropdown({ user, logout }) {
  const { user: authUser } = useContext(AuthContext);
  const { openModal } = useContext(ModalContext);

  const menuItems = getUserMenuConfig({ user, logout, openModal });

  // ✅ TẠO MỘT BIẾN CHO TÊN VIẾT TẮT ĐỂ DÙNG LẠI
  const userInitial = user?.display_name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Dropdown>
      <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
        <Image
          src={user?.avatar || `https://placehold.co/32x32/28a745/FFFFFF?text=${userInitial}`}
          roundedCircle
          width={32}
          height={32}
          style={{ marginLeft: '8px' }}
          alt={user?.email || 'User avatar'}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="custom-dropdown-menu">
        {menuItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={`section-${idx}`} className="custom-dropdown-header">
                {item.section}
              </div>
            );
          }
          if (item.divider) {
            return <div key={`divider-${idx}`} className="custom-dropdown-divider" />;
          }
          return (
            <Dropdown.Item
              key={item.label}
              as={item.href ? Link : 'div'}
              to={item.href}
              onClick={item.onClick}
              disabled={item.disabled}
              className="custom-dropdown-item"
            >
              {item.avatar && (
                <Image
                  src={item.avatar}
                  roundedCircle
                  width={32}
                  height={32}
                  style={{ marginRight: '12px' }}
                />
              )}
              {item.label}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
