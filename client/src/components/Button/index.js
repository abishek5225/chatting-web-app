import React from 'react';
import "./style.css";

const Button= ({
    label = 'Button',
    type = 'button',
    disabled = false,
}) => {
  return (
    <div className="btn">
        <button>{label}</button>
    </div>
  )
}

export default Button