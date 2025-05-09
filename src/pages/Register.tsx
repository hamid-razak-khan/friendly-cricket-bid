
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await register(username, password);
      toast({
        title: "Registration successful",
        description: "Welcome to Cricket Auction! You can now create your team.",
      });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "Username may already be taken or an error occurred. Please try again.",
        variant: "destructive"
      });
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
