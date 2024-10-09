"use client"

import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Typography, Paper, Stack} from "@mui/material";
import TaskViewer from "@/app/components/TaskViewer";

import { getEntity } from "@/app/utils";


const StyledProjectPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#CEE5FF",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: '100%',
    // height: '90%',
    zIndex: theme.zIndex.drawer + 1,
}));

const StyledProjectName = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2),
    color: '#005BC7',
}));

export default function ProjectViewer( { projectEntity} ) {

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
            <StyledProjectName variant="h4" component="h1">{projectEntity.name}</StyledProjectName>
            <Stack flexGrow={1} spacing={2} direction='column'>
                {topLevelTasks.map(task => (
                    <TaskViewer key={task.id} taskEntity={task} />
                ))}
            </Stack>
        </StyledProjectPaper>
    )
}
















