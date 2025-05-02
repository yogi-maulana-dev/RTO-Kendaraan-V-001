import React from 'react';
import { useNavigate } from 'react-router-dom'; // pastikan react-router-dom sudah diinstall

const menuItems = [
    { icon: '👤', label: 'User', path: '/users' },
    { icon: '🏢', label: 'PT', path: '/sim-management' },
    { icon: '🛢️', label: 'Tabung' },
    { icon: '🛢️', label: 'Tabung PT' },
    { icon: '🚗', label: 'Nopol' },
    { icon: '⛽', label: 'SPBE' },
    { icon: '🏪', label: 'Penjualan' },
    { icon: '🏬', label: 'Gudang' },
    { icon: '➡️', label: 'Logout' },
];

const Dashboard = () => {
    const navigate = useNavigate(); // buat navigasi programatik

    const handleClick = (item: typeof menuItems[number]) => {
        if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Page</h1>
            <p>Welcome to the dashboard!</p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '20px',
                    marginTop: '30px',
                }}
            >
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            padding: '20px',
                            transition: '0.3s',
                            cursor: item.path ? 'pointer' : 'default',
                        }}
                        onClick={() => handleClick(item)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>{item.icon}</div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
