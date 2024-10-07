// components/LibraryPane.jsx
import React, { useState } from "react";

const LibraryPane = ({ isOpen, onToggle }) => {
  const [title, setTitle] = useState('');

  return (
    <div 
      className={`fixed left-16 top-0 h-full bg-blue transition-all duration-300 z-10 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}  
    >
      <div className="p-4 h-full flex flex-col text-white">
        {/* Toolbar Icons */}
        <div className="flex justify-end items-center space-x-2 mb-6">
          <button className="p-1 hover:bg-blue-400 rounded">
            <i className="bi bi-sort-alpha-down text-xl"></i>
          </button>
          <button className="p-1 hover:bg-blue-400 rounded">
            <i className="bi bi-search text-xl"></i>
          </button>
          <button className="p-1 hover:bg-blue-400 rounded">
            <i className="bi bi-plus text-xl"></i>
          </button>
          <button 
            className="p-1 hover:bg-blue-400 rounded"
            onClick={onToggle}
          >
            <i className={`bi bi-arrow-left text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
          </button>
        </div>

        {/* Library XYZ Title */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Library XYZ</h2>
        </div>

        {/* Add Title Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Add title here"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-blue-400 text-blue placeholder-blue rounded focus:outline-none focus:ring-2 focus:ring-blue"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <i className="bi bi-three-dots-vertical text-blue-200"></i>
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-2">Please add a title to your notebook</p>
        </div>

        {/* Add Notebook Button */}
        <button className="w-full p-2 bg-blue-400 hover:bg-blue-600 rounded flex items-center justify-center mb-4">
          <i className="bi bi-plus text-xl mr-2"></i> Add Notebook
        </button>

        {/* Additional content can go here */}
      </div>
    </div>
  );
};

export default LibraryPane;
