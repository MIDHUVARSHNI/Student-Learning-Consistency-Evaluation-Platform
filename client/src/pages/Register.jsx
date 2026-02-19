import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../slices/authSlice';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student', // default role
        collegeId: '',
    });

    const { name, email, password, role, collegeId } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message);
        }

        if (isSuccess || user) {
            navigate('/');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = {
            name,
            email,
            password,
            role,
            collegeId: role === 'educator' ? collegeId : undefined
        };
        dispatch(register(userData));
    };

    if (isLoading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <UserPlus className="mx-auto h-12 w-12 text-blue-500" />
                    <h2 className="text-2xl font-bold mt-2">Consistify Register</h2>
                    <p className="text-gray-600">Create a new account</p>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="name"
                            name="name"
                            value={name}
                            placeholder="Enter your name"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Enter password"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <select
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="role"
                            name="role"
                            value={role}
                            onChange={onChange}
                        >
                            <option value="student">Student</option>
                            <option value="educator">Educator</option>
                        </select>
                    </div>
                    {role === 'educator' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="collegeId"
                                name="collegeId"
                                value={collegeId}
                                placeholder="Enter College Registration ID"
                                onChange={onChange}
                                required
                            />
                        </div>
                    )}
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
                        Submit
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
