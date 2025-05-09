import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "fixed z-50 p-2 rounded-lg bg-[#0A0B14]/80 border border-white/10 transition-all duration-300",
          isOpen 
            ? "left-[248px] top-20" 
            : "left-4 top-20",
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Navbar */}
      <nav className={cn(
        "fixed left-0 top-16 bottom-0 w-64 z-40 backdrop-blur-sm border-r border-white/10 flex flex-col bg-[#0A0B14]/80 transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        scrolled && "bg-[#0A0B14]/90"
      )}>
        <div className="py-6 px-4 flex flex-col h-full">
          {/* Main Menu */}
          <div className="flex flex-col space-y-2 flex-1 pt-8">
            <NavLink to="/" active={location.pathname === "/"} onClick={() => setIsOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/marketplace" active={location.pathname.startsWith("/marketplace")} onClick={() => setIsOpen(false)}>
              Marketplace
            </NavLink>
            <NavLink to="/about" active={location.pathname === "/about"} onClick={() => setIsOpen(false)}>
              About Us
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/create" active={location.pathname === "/create"} onClick={() => setIsOpen(false)}>
                  Create Gift
                </NavLink>
                <NavLink to="/claim" active={location.pathname === "/claim"} onClick={() => setIsOpen(false)}>
                  Claim Gift
                </NavLink>
                <NavLink to="/create-background" active={location.pathname === "/create-background"} onClick={() => setIsOpen(false)}>
                  Create Background
                </NavLink>
                <NavLink to="/profile" active={location.pathname === "/profile"} onClick={() => setIsOpen(false)}>
                  Profile
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" active={location.pathname === "/login"} onClick={() => setIsOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/signup" active={location.pathname === "/signup"} onClick={() => setIsOpen(false)}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ to, active, children, onClick }: NavLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 transition-colors rounded-lg flex items-center",
        active 
          ? "text-white bg-white/10" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary" />
      )}
    </Link>
  );
};

export default Navbar;
