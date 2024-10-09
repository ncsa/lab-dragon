"use client";
import React, { useContext, useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

import ProjectViewer from '../../components/ProjectViewer';
import { ExplorerContext } from '../../contexts/explorerContext';
import { getEntity } from "@/app/utils";

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
  const [ topLevelProjects, setTopLevelProjects ] = useState(null);

  const openDrawerWidth = 24;
  const closedDrawerWidth = -8;

  useEffect(() => {
    if (currentlySelectedItem) {
      getNotebookParent(currentlySelectedItem).then(data => {
        if (data && data !== currentNotebookId) {
          setCurrentNotebookId(data);
        }
      });
    }
  }, [currentlySelectedItem]);

  useEffect(() => {
    if (currentNotebookId) {
      getEntity(currentNotebookId).then(data => {
        const parsedData = JSON.parse(data);
        setCurrentNotebookEnt(parsedData);
  
        // Use Promise.all to wait for all getEntity calls to complete
        Promise.all(parsedData.children.map(child => getEntity(child)))
          .then(projects => {
            const newTopLevelProjects = projects.map(project => JSON.parse(project));
            setTopLevelProjects(newTopLevelProjects);
          });
      });
    }
  }, [currentNotebookId]);

  return(
    // marginLeft is here because it is dynamically set by the drawer state so it needs to be set in the component.
    <MainContent marginLeft={drawerOpen ? openDrawerWidth : closedDrawerWidth}>
      <Stack flexGrow={2} spacing={2} direction='column'>
      {topLevelProjects && topLevelProjects.map(project => (
        <ProjectViewer key={project.id} projectEntity={project} />
      ))}
      </Stack>
    </MainContent>
  )
}