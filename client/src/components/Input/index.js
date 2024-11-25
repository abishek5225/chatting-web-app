import React from 'react';
import './style.css';

const Input = ({
    label = '',
    name = '',
    type = 'text',
    className='',
    inputClassName = '',
    isRequired = false,
    placeholder = '',
    value = '',
    onChange = () => {},
}) => {
    return (
        <div className={` ${className}`}>
            <label htmlFor={name} className="block mb-2 ">{label}</label>
            <input className={`border text-[black] p-2.5 rounded-[15px] border-solid border-[rgb(198,190,190)]
  outline: 0 ${inputClassName}`}
                type={type}
                id={name}
                
                placeholder={placeholder}
                required={isRequired}
                value={value} 
                onChange={onChange}
            />
        </div>
    );
};

export default Input;
