"use client"
import React, { createContext, useState, useContext } from 'react';

// Create a context
export const BookmarkContext = createContext();

// Create a provider component
export const BookmarkProvider = ({ children }) => {
  const [onlyShowBookmarked, setOnlyShowBookmarked] = useState(false);

  return (
    <BookmarkContext.Provider value={{ onlyShowBookmarked, setOnlyShowBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};