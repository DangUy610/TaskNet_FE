// AppsDropdown.jsx
import { Dropdown, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MdApps } from 'react-icons/md';

export default function AppsDropdown() {
  return (
    <Dropdown drop="down" className="apps-dropdown position-relative" align="start">
        <Dropdown.Toggle
            as={Button}
            variant="link"
            id="apps-menu-toggle"
            style={{
                padding: 0,
                lineHeight: 0,
                color: '#000',
                position: 'relative',
                zIndex: 2
                }}
            className="p-0 app-menu-toggle"
        >
            <MdApps size={24} className='apps-icon' />
        </Dropdown.Toggle>

        <Dropdown.Menu
            style={{ minWidth: 240, padding: 0,maxHeight: '60vh', overflowY: 'auto'}}
            className="shadow"
        >
            {/* Header of menu */}
            <div className="px-3 py-2 font-weight-bold text-secondary" style={{ fontSize: 12 }}>
            More from Atlassian
            </div>

            {/* Main items */}
            <Dropdown.Item as={Link} to="/">
            <span role="img" aria-label="home">🏠</span> Home
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/jira">
            <img src="/icons/jira.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Jira
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/">
            <img src="/icons/trello.svg" alt="" width={16} className="mr-2 align-text-bottom" /> TaskNest
            </Dropdown.Item>
            <Dropdown.Item>
            <span role="img" aria-label="teams">👥</span> Teams
            </Dropdown.Item>
            <Dropdown.Item>
            <span role="img" aria-label="settings">⚙️</span> Administration
            </Dropdown.Item>

            <Dropdown.Divider />

            {/* Recommended section */}
            <div className="px-3 py-2 font-weight-bold text-secondary" style={{ fontSize: 12 }}>
            Recommended for your team
            </div>
        
            <Dropdown.Item>
            <img src="/icons/confluence.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Confluence
            </Dropdown.Item>
            <Dropdown.Item>
            <img src="/icons/loom.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Loom
            </Dropdown.Item>
            <Dropdown.Item>
            <img src="/icons/jpd.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Jira Product Discovery
            </Dropdown.Item>
            <Dropdown.Item>
            <span role="img" aria-label="more">➕</span> More Atlassian apps
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
  );
}

