"use client";
import React, { useContext, useEffect, useState } from 'react';
import {Box, IconButton, Stack, Typography} from '@mui/material';
import { styled } from '@mui/material/styles';

import ProjectViewer from '../../components/ProjectViewer';
import { ExplorerContext } from '../../contexts/explorerContext';
import { getEntity } from "@/app/utils";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";

async function getNotebookParent(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/notebook_parent`);
    // const res = await fetch(`/api/entities/${id}/notebook_parent`);
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

    const openDrawerWidth = 24;
    const closedDrawerWidth = -8;

    const { drawerOpen, currentlySelectedItem, entitySectionIdRef } = useContext(ExplorerContext);
    const [ notebook, setNotebook ] = useState({ID: null});
    const [ topLevelProjects, setTopLevelProjects ] = useState(null);
    const [ newProjectDialogOpen, setNewProjectDialogOpen ] = useState(false);

    const handleOpenNewProjectDialog = () => {
        setNewProjectDialogOpen(true);
    }

    const handleCloseNewProjectDialog = () => {
        setNewProjectDialogOpen(false);
    }

    const reloadNotebook = () => {
        getEntity(notebook.ID).then(newNotebook => {
            setNotebook(JSON.parse(newNotebook));
        });
    }

    useEffect(() => {
        if (currentlySelectedItem) {
            getNotebookParent(currentlySelectedItem).then(data => {
                if (data && data !== notebook.ID) {
                    getEntity(data).then(notebookData => {
                        setNotebook(JSON.parse(notebookData));
                    })
                }
            });

            if (entitySectionIdRef.current[currentlySelectedItem]) {
                entitySectionIdRef.current[currentlySelectedItem].scrollIntoView({ behavior: 'smooth' });
            }

        }
    }, [currentlySelectedItem]);

  useEffect(() => {
        if (notebook.ID) {
          Promise.all(notebook.children.map(child => getEntity(child))).then(projects => {
            const newTopLevelProjects = projects.map(project => JSON.parse(project));
            setTopLevelProjects(newTopLevelProjects);
          })
        }
      }, [notebook]);


    return(
        // marginLeft is here because it is dynamically set by the drawer state so it needs to be set in the component.
        <MainContent marginLeft={drawerOpen ? openDrawerWidth : closedDrawerWidth}>
            {notebook.name ? (
                <Typography variant="h3" paddingTop={-10} marginTop={-5} paddingBottom={2}>Currently Looking at Notebook: <em>{notebook.name}</em></Typography>
            ) : (
                <Typography variant="h3" paddingTop={-10} marginTop={-5} paddingBottom={2}>Please select a Notebook</Typography>
            )}
            <Stack flexGrow={2} spacing={2} direction='column'>
                {topLevelProjects && topLevelProjects.map(project => (
                    <div key={project.ID} ref={entitySectionIdRef.current[project.ID]}>
                        <ProjectViewer projectEntity={project} notebookName={notebook.name} />
                    </div>
                ))}
                {notebook.ID && (
                    <Box>
                        <Box display="flex" flexDirection="column" alignItems="center" paddingTop={2}>
                            <IconButton onClick={handleOpenNewProjectDialog}>
                                <AddBoxOutlinedIcon sx={{color: "white"}} />
                            </IconButton>
                        </Box>
                        <NewEntityDialog
                            user="marcos"
                            type="Project"
                            parentName={notebook.name}
                            parentID={notebook.ID}
                            open={newProjectDialogOpen}
                            onClose={handleCloseNewProjectDialog}
                            reloadParent={reloadNotebook}
                        />
                    </Box>
                )}
            </Stack>
        </MainContent>
    )
}