
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className} p-6`}>
      {children}
    </div>
  );
}
