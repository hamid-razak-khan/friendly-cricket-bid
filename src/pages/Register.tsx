
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const Register = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await register(username, password);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cricket-container py-12">
      <div className="max-w-md mx-auto">
        <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} />
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-cricket-blue hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
