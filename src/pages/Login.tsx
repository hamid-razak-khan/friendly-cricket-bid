
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await login(username, password);
      toast({
        title: "Login successful",
        description: "Welcome back to Cricket Auction!",
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cricket-container py-12">
      <div className="max-w-md mx-auto">
        <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-cricket-blue hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
