"use client"

import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Typography, Paper, Stack, TextField, IconButton, InputAdornment, Input } from "@mui/material";
import TaskViewer from "@/app/components/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { getEntity } from "@/app/utils";


const StyledProjectPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#CEE5FF",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    // paddingTop: theme.spacing(0.2),
    paddingBottom: theme.spacing(1),
    width: '100%',
    // height: '90%',
    zIndex: theme.zIndex.drawer + 1,
    color: '#005BC7'
}));

const StyledProjectName = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2),
    color: '#005BC7',
}));

export default function ProjectViewer( { projectEntity, notebookName } ) {

    const [topLevelTasks, setTopLevelTasks] = useState([]);

    const project = projectEntity;

    useEffect(() => {
        Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
            const newTopLevelTasks = tasks.map(t => JSON.parse(t));
            setTopLevelTasks(newTopLevelTasks);
        })
    }, [projectEntity])

    return (
        <StyledProjectPaper>
             <Stack direction="row" alignItems="center" justifyContent="space-between">
                <StyledProjectName fontWeight="bold" fontSize="1.5rem">{projectEntity.name}</StyledProjectName>
                <Stack direction="row" spacing={1} alignItems="center">
                <IconButton variant="outlined" color="#FFFFFF">
                        <ChevronLeftIcon />
                </IconButton>
                    <Input
                        variant="filled"
                        size="small"
                        endAdornment={
                            <InputAdornment color="#4C9DFC">
                                <IconButton>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }/>

                </Stack>
            </Stack>
            <Stack flexGrow={1} spacing={2} direction='column' paddingLeft={3}>
                {topLevelTasks.map(task => (
                    <TaskViewer key={task.id} taskEntity={task} breadcrumbsText={[notebookName, projectEntity.name, task.name]} />
                ))}
            </Stack>
        </StyledProjectPaper>
    )
}


