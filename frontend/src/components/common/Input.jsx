import React from 'react';

const Input = ({ label, type, name, value, onChange, error, placeholder }) => {
  return (
    <div className="mb-4">
      {label && <label htmlFor={name} className="block text-sm/6 font-medium text-gray-900">{label}</label>}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-0.5 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
          error ? 'outline-red-600' : 'outline-gray-300'
        }`}
      />
      {error && <p className="mt-0.5 text-sm/6 text-red-600">{error}</p>}
    </div>
  );
};

export default Input;