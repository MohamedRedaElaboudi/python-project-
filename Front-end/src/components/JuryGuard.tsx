import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type JuryGuardProps = {
    children?: React.ReactNode;
};

import { Outlet } from 'react-router-dom';

export default function JuryGuard({ children }: JuryGuardProps) {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('JuryGuard: Checking auth...');
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                console.log('JuryGuard: No token/user, redirecting to login');
                navigate('/login');
                return;
            }

            try {
                const user = JSON.parse(userStr);
                console.log('JuryGuard: User found:', user);
                if (!['jury', 'teacher', 'admin', 'chef'].includes(user.role)) {
                    console.warn('Unauthorized access to jury area. Role:', user.role);
                    navigate('/login');
                    return;
                }
                setIsAuthorized(true);
            } catch (e) {
                console.error('JuryGuard: Error parsing user', e);
                navigate('/login');
            } finally {
                setChecking(false);
            }
        };
        checkAuth();
    }, [navigate]);

    if (checking) {
        return <div>Vérification des droits...</div>;
    }

    if (!isAuthorized) {
        return null;
    }

    return children ? <>{children}</> : <Outlet />;
}
