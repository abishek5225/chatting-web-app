import React from 'react';

const Button = ({
    label = 'Button',
    type = 'button',
    disabled = false,
    onClick = () => {},
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
    >
      {label}
    </button>
  )
}

export default Button
