import { useState, useCallback } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { SettingsContent } from './SettingsContent';
import '../../styles/settings.scss'; // Import the SCSS file

export function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  const openGeneral = useCallback(() => {
    setActiveTab('General');
  }, []);


  const openTemplate = useCallback(() => {
    setActiveTab('Template');
  }, []);

  return (
    <div className='settings'>
      <Sidebar className='sidebar'>
        <Menu className='menu'>
          <MenuItem
            className={`menu-item ${activeTab === 'General' ? 'active' : ''}`}
            onClick={openGeneral}
          >
            General
          </MenuItem>
          <MenuItem
            className={`menu-item ${activeTab === 'Template' ? 'active' : ''}`}
            onClick={openTemplate}
          >
            Template
          </MenuItem>
        </Menu>
      </Sidebar>
      <div className='settings-content'>
        <SettingsContent activeTab={activeTab} />
      </div>
    </div>
  );
}