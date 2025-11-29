// src/components/HeaderTabs.js

import { Tab } from '@headlessui/react';
import './HeaderTabs.css';

// Список наших вкладок
const tabs = ['О нас', 'FAQ', 'Связаться', 'Ресурсы', 'Партнеры'];

function HeaderTabs() {
  return (
    <div className="tabs-container">
      <Tab.Group>
        {/* Это кнопки для переключения вкладок */}
        <Tab.List className="tab-list">
          {tabs.map((tabName) => (
            <Tab key={tabName} className={({ selected }) =>
              `tab-button ${selected ? 'selected' : ''}`
            }>
              {tabName}
            </Tab>
          ))}
        </Tab.List>

        {/* Это панели с контентом для каждой вкладки (пока что с заглушками) */}
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