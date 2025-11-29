// src/App.js
import { Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout'; 
import DashboardPage from './pages/DashboardPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import ReportsView from './pages/dashboard/ReportsView';
import CreateReportView from './pages/dashboard/CreateReportView';
import SearchView from './pages/dashboard/SearchView';
import ThreatsView from './pages/dashboard/ThreatsView';
import CheckView from './pages/dashboard/CheckView';
import SigmaRulesView from './pages/dashboard/SigmaRulesView';
import SigmaCollectionView from './pages/dashboard/SigmaCollectionView';
import AccountView from './pages/dashboard/AccountView';
import AlertsView from './pages/dashboard/AlertsView';
import MalwareDetailView from './pages/dashboard/MalwareDetailView';
import ReportDetailView from './pages/dashboard/ReportDetailView';
import AdminPanel from './pages/dashboard/AdminPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route index element={<OverviewPage />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="create" element={<CreateReportView />} />
        <Route path="search" element={<SearchView />} />
        <Route path="malware/:id" element={<MalwareDetailView />} />
        <Route path="reports/:id" element={<ReportDetailView />} />
        <Route path="threats" element={<ThreatsView />} />
        <Route path="check" element={<CheckView />} />
        <Route path="sigma" element={<SigmaRulesView />} />
        <Route path="sigma-collection" element={<SigmaCollectionView />} />
        <Route path="alerts" element={<AlertsView />} />
        <Route path="account" element={<AccountView />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;