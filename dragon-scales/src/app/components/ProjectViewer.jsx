"use client"

import { useState, useEffect, useContext, useRef } from "react";
import { styled } from '@mui/material/styles';
import {
    Typography,
    Paper,
    Stack,
    IconButton,
    InputAdornment,
    Input,
    Box,
    DialogTitle,
    DialogContent, DialogContentText, DialogActions, Button, Dialog
} from "@mui/material";
import TaskViewer from "@/app/components/TaskViewerComponents/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {deleteEntity, getEntity} from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { ExplorerContext } from "@/app/contexts/explorerContext";
import DeleteIcon from "@mui/icons-material/Delete";


const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    color: theme.palette.error.main,
}));


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

export default function ProjectViewer( { projectEntity, notebookName, reloadNotebook } ) {

    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [project, setProject] = useState(projectEntity);
    const [topLevelTasks, setTopLevelTasks] = useState([]);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const projectRef = useRef(null);
    entitySectionIdRef.current[project.ID] = projectRef;

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

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteProject = async () => {
        try {
            const success = await deleteEntity(project.ID);
            handleCloseDeleteDialog();
            if (success) {
                reloadNotebook();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    useEffect(() => {
        Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
            const newTopLevelTasks = tasks.map(t => JSON.parse(t));
            setTopLevelTasks(newTopLevelTasks);
        })
    }, [project])

    return (
        <Box ref={projectRef}>
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
                        <StyledDeleteButton onClick={handleOpenDeleteDialog} aria-label="delete task">
                            <DeleteIcon />
                        </StyledDeleteButton>
                    </Stack>
                </Stack>
                <Stack flexGrow={1} spacing={2} direction='column' alignItems="center" width="100%">
                    {topLevelTasks.map(task => (
                        <Box key={task.ID}  width="100%" ref={entitySectionIdRef.current[task.ID]}>
                            <TaskViewer taskEntity={task}
                                        breadcrumbsText={[notebookName, project.name, task.name]}
                                        reloadProject={reloadProject} />
                        </Box>
                    ))}
                </Stack>
                <Box display="flex" flexDirection="column" alignItems="center" paddingTop={2}>
                    <IconButton onClick={handleOpenNewEntityDialog}>
                        <AddBoxOutlinedIcon sx={{color: "#4C9DFC"}} />
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
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Project Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this Project?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteProject} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}


