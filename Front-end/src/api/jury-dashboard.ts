import axios from 'axios';


const API_URL = `http://${window.location.hostname}:5000/api/jury/dashboard`;

export const getJuryDashboardData = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
