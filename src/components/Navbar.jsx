// Navbar component - simplified header without nav menu
const Navbar = () => {
  const styles = {
    header: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '24px',
      padding: '16px 0',
      borderBottom: '1px solid #e5e7eb',
    },
    brandSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    badge: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      padding: '6px 14px',
      borderRadius: '999px',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '0.875rem',
    },
    toggleBtn: {
      display: 'none',
      padding: '8px',
      backgroundColor: 'transparent',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1.25rem',
      color: '#6b7280',
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.brandSection}>
        <button className="wrapper-menu d-xl-none" style={{...styles.toggleBtn, display: 'block'}}>
          <i className="las la-bars"></i>
        </button>
        <span style={styles.badge}>SimpleBIM</span>
        <span style={styles.subtitle}>Revit Add-in • License • Auto-update</span>
      </div>
    </header>
  );
};

export default Navbar;
