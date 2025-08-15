import React from 'react';

const Input = ({
    label = '',
    name = '',
    type = 'text',
    className = '',
    inputClassName = '',
    isRequired = false,
    placeholder = '',
    value = '',
    onChange = () => {},
}) => {
    return (
        <div className={`${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input 
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${inputClassName}`}
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                required={isRequired}
                value={value} 
                onChange={onChange}
            />
        </div>
    );
};

export default Input;
