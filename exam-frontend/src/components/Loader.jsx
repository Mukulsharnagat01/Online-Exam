import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-t-2 border-b-2 border-green-500`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

export default Loader;