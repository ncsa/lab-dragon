"use client"

import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Typography, Paper, Stack, IconButton, InputAdornment, Input, Box } from "@mui/material";
import TaskViewer from "@/app/components/TaskViewerComponents/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { getEntity } from "@/app/utils";
import NewEntityDialog from "@/app/components/NewEntityDialog";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";


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

    const [project, setProject] = useState(projectEntity);
    const [topLevelTasks, setTopLevelTasks] = useState([]);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);

    const handleOpenNewEntityDialog = () => {
        setNewEntityDialogOpen(true);
    }

    const handleCloseNewEntityDialog = () => {
        setNewEntityDialogOpen(false);
    }

    const reloadProject = () => {
        getEntity(project.ID).then(newProject => {
            setProject(JSON.parse(newProject));
        });
    }

    useEffect(() => {
        Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
            const newTopLevelTasks = tasks.map(t => JSON.parse(t));
            setTopLevelTasks(newTopLevelTasks);
        })
    }, [project])

    return (
        <Box>
            <StyledProjectPaper>
                 <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <StyledProjectName fontWeight="bold" fontSize="1.5rem">{project.name}</StyledProjectName>
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
                <Stack flexGrow={1} spacing={2} direction='column' alignItems="center" width="100%">
                    {topLevelTasks.map(task => (
                        <Box key={task.ID}  width="100%">
                            <TaskViewer taskEntity={task} breadcrumbsText={[notebookName, project.name, task.name]} />
                        </Box>
                    ))}
                </Stack>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <IconButton onClick={handleOpenNewEntityDialog}>
                        <AddBoxOutlinedIcon />
                    </IconButton>
                </Box>
            </StyledProjectPaper>
            <NewEntityDialog
                user="marcos"
                type="Task"
                parentName={project.name}
                parentID={project.ID}
                open={newEntityDialogOpen}
                onClose={handleCloseNewEntityDialog}
                reloadParent={reloadProject}
            />
        </Box>
    )
}
















