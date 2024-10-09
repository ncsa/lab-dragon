"use client";
import React, { useState, useEffect, useContext } from 'react';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

import ProjectViewer from '../../components/projectViewer';
import { ExplorerContext } from '../../contexts/explorerContext';

async function getEntity(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/${id}`);
  return await res.json();
}

async function getNotebookParent(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/${id}/notebook_parent`);
  return res.json();
}

const MainContent = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  paddingLeft: 64,
  backgroundColor: '#4C9DFC',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10),
    paddingLeft: `calc(64px + ${theme.spacing(10)})`,
  },
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));


export default function Library() {

  const { drawerOpen, currentlySelectedItem } = useContext(ExplorerContext);
  const [ currentNotebookId, setCurrentNotebookId ] = useState("");
  const [ currentNotebookEnt, setCurrentNotebookEnt ] = useState(null);
  const [ topLevelProjects, setTopLevelProjects ] = useState([]);

  const openDrawerWidth = 24;
  const closedDrawerWidth = -8;

  useEffect(() => {
    if (currentlySelectedItem) {
      console.log(`Getting currently selected item: ${currentlySelectedItem}`);
      getNotebookParent(currentlySelectedItem).then(data => {
        if (data && data != currentNotebookEnt) {
          console.log(`I have found a parent:`);
          console.log(data);
          setCurrentNotebookId(data);
        }
      });
    }
  }, [currentlySelectedItem]);

  useEffect(() => {
    if (currentNotebookId) {
      console.log(`Getting current notebook: ${currentNotebookId}`);
      getEntity(currentNotebookId).then(data => {
        const parsedData = JSON.parse(data);
        console.log(`I have found a notebook:`);
        console.log(parsedData);
        setCurrentNotebookEnt(parsedData);
        
        // Initialize a new array to accumulate projects
        const newTopLevelProjects = [];
  
        parsedData.children.forEach(child => {
          getEntity(child).then(project => {
            const parsedProject = JSON.parse(project);
            
            // Add each project to the new array
            newTopLevelProjects.push(parsedProject);
  
            // Update the state with the accumulated projects
            setTopLevelProjects([...newTopLevelProjects]);
          });
        });
      });
    }
  }, [currentNotebookId]);

  return(
    // marginLeft is here because it is dynamically set by the drawer state so it needs to be set in the component.
    <MainContent marginLeft={drawerOpen ? openDrawerWidth : closedDrawerWidth}>
      <Stack flexGrow={2} spacing={2} direction='column'>
      {topLevelProjects.map(project => (
        <ProjectViewer key={project.id} projectEntity={project} />
      ))}
      </Stack>
    </MainContent>
  )
}