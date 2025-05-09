
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';
import { User, LogIn, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-cricket-blue text-white fixed w-full z-10">
      <div className="cricket-container">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-cricket-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-poppins font-bold text-xl">Cricket Auction</span>
            </Link>
            
            {/* Desktop menu */}
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cricket-lightBlue">
                  Home
                </Link>
                <Link to="/players" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cricket-lightBlue">
                  Players
                </Link>
                <Link to="/auction" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cricket-lightBlue">
                  Auction
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cricket-lightBlue">
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* User menu */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <span className="text-sm font-medium">
                    {user?.teamName ? `${user.teamName}` : user?.username}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-cricket-lightBlue"
                  onClick={logout}
                >
                  <User className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-cricket-lightBlue">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cricket-lightBlue"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/players" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cricket-lightBlue"
            onClick={() => setMobileMenuOpen(false)}
          >
            Players
          </Link>
          <Link 
            to="/auction" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cricket-lightBlue"
            onClick={() => setMobileMenuOpen(false)}
          >
            Auction
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cricket-lightBlue"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
