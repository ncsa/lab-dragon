"use client"
import React, { createContext, useState, useRef } from 'react';

// Create a context
export const ExplorerContext = createContext();

// Create a provider component
export const ExplorerProvider = ({ children }) => {
  const [currentlySelectedItem, setCurrentlySelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const entitySectionIdRef = useRef({});  // Keeps id of entity as key and a ref to the component as value.


  return (
<ExplorerContext.Provider value={{ currentlySelectedItem, setCurrentlySelectedItem,
                                    drawerOpen, setDrawerOpen,
                                    entitySectionIdRef }}>
      {children}
    </ExplorerContext.Provider>
  );
};