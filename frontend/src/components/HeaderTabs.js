// src/components/HeaderTabs.js
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import './HeaderTabs.css';

const tabs = ['О нас', 'FAQ', 'Связаться', 'Ресурсы', 'Партнеры'];

function HeaderTabs() {
  // Состояние для отслеживания индекса выбранной вкладки.
  // -1 означает, что по умолчанию ничего не выбрано.
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <div className="tabs-container">
      {/* Управляем состоянием Tab.Group, передавая selectedIndex и onChange */}
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="tab-list">
          {tabs.map((tabName) => (
            <Tab key={tabName} className={({ selected }) => 
              `tab-button ${selected ? 'selected' : ''}`
            }>
              {tabName}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="tab-panels">
          {tabs.map((tabName, idx) => (
            <Tab.Panel key={idx} className="tab-panel">
              Содержимое для вкладки "{tabName}"
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default HeaderTabs;