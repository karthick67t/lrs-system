import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { token, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
  };

  const normalizedRole = role ? (String(role).toUpperCase().trim().startsWith('ROLE_') ? String(role).toUpperCase().trim().substring(5) : String(role).toUpperCase().trim()) : null;

  if (allowedRoles && (!normalizedRole || !allowedRoles.includes(normalizedRole))) {
    return (
      <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <div className="main-content">
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="page-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '36px' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '24px' }}>403 - Permission Denied</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                Your current role (<strong>{role}</strong>) does not have access to this module. Please contact your Super Administrator.
              </p>
              <a href="/dashboard" className="btn btn-primary">
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
