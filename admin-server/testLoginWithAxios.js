const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5001/api/admin/login', {
            email: 'admin@example.com',
            password: 'adminpassword123'
        });
        console.log('Login Successful:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
};

testLogin();
