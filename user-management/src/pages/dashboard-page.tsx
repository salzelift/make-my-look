import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../lib/api';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);

    try {
      await authAPI.deleteUser();
      logout();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Dashboard</h1>
        
        <div style={styles.userInfo}>
          <h2 style={styles.subtitle}>User Information</h2>
          <div style={styles.infoRow}>
            <strong>Name:</strong> {user?.name}
          </div>
          <div style={styles.infoRow}>
            <strong>Email:</strong> {user?.email}
          </div>
          <div style={styles.infoRow}>
            <strong>Type:</strong> {user?.userType}
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={styles.deleteButton}
          >
            Delete Account
          </button>
        </div>

        {showDeleteConfirm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Delete Account</h3>
              <p style={styles.modalText}>
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              {deleteError && <div style={styles.error}>{deleteError}</div>}
              <div style={styles.modalActions}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  style={styles.confirmDeleteButton}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError('');
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    border: '2px solid #000000',
    padding: '40px',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '30px',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '20px',
  },
  userInfo: {
    marginBottom: '30px',
    padding: '20px',
    border: '2px solid #000000',
  },
  infoRow: {
    marginBottom: '15px',
    fontSize: '16px',
    color: '#000000',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  logoutButton: {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '2px solid #000000',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    padding: '30px',
    maxWidth: '400px',
    width: '90%',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '15px',
  },
  modalText: {
    fontSize: '16px',
    color: '#000000',
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  confirmDeleteButton: {
    padding: '10px 20px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '2px solid #000000',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    border: '2px solid #000000',
    color: '#000000',
    fontSize: '14px',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
};

export default DashboardPage;

