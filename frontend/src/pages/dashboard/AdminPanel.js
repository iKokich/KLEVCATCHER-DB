import { useState, useEffect } from 'react';
import { FiUser, FiTrash2, FiLock, FiUnlock, FiPlus, FiX, FiEdit2 } from 'react-icons/fi';
import apiUrl from '../../apiClient';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/users'));
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(apiUrl('/api/admin/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewUser({ username: '', email: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      await fetch(apiUrl(`/api/admin/users/${userId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_blocked: !isBlocked })
      });
      fetchUsers();
    } catch (err) {
      console.error('Error toggling block:', err);
    }
  };


  const handleChangeRole = async (userId, newRole) => {
    try {
      await fetch(apiUrl(`/api/admin/users/${userId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(apiUrl(`/api/admin/users/${userId}`), { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>User Management</h2>
        <button className="admin-btn primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus /> Add User
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={user.is_blocked ? 'blocked' : ''}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar"><FiUser /></div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                    {user.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={`action-btn ${user.is_blocked ? 'unblock' : 'block'}`}
                      onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                      title={user.is_blocked ? 'Unblock' : 'Block'}
                    >
                      {user.is_blocked ? <FiUnlock /> : <FiLock />}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateUser}>
              {error && <div className="modal-error">{error}</div>}
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
