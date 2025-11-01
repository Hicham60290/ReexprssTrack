
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl hover:scale-105',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl hover:scale-105',
    outline: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 disabled:border-gray-300 disabled:text-gray-400 hover:scale-105',
    ghost: 'text-purple-600 hover:bg-purple-50 hover:text-purple-700 disabled:text-gray-400 hover:scale-105',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm font-bold',
    md: 'px-6 py-3 text-base font-bold',
    lg: 'px-8 py-4 text-lg font-bold',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
