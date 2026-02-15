import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const navigate = useNavigate();
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        useEffect(() => {
            if (!token) {
                navigate('/login');
            }
        }, [token, navigate]);

        if (!token) {
            return null; // Or a loading spinner
        }

        return <WrappedComponent {...props} token={token} username={username} />;
    };
};

export default withAuth;