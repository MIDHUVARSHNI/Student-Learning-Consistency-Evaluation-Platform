const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'adminpassword123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login Successful:', data);
        } else {
            console.error('Login Failed:', data);
        }
    } catch (error) {
        console.error('Login Error:', error.message);
    }
};

testLogin();
