"use client"
import React, { createContext, useState, useContext } from 'react';

// Create a context
export const ExplorerContext = createContext();

// Create a provider component
export const ExplorerProvider = ({ children }) => {
  const [currentlySelectedItem, setCurrentlySelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
<ExplorerContext.Provider value={{ currentlySelectedItem, setCurrentlySelectedItem,
                                    drawerOpen, setDrawerOpen }}>
      {children}
    </ExplorerContext.Provider>
  );
};