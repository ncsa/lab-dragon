"use client"

import { useState, useEffect, useRef, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
    Typography,
    Paper,
    Stack,
    Breadcrumbs,
    Box,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Input
} from "@mui/material";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import { deleteEntity, getEntity, changeEntityName, sortAndFilterChildren } from "@/app/utils";
import { ExplorerContext } from "@/app/contexts/explorerContext";

// Styled components remain the same...
const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    color: theme.palette.error.main,
}));

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(7),
    color: '#4C9DFC',
}));

const StyledTaskPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#FFFFFF",
    width: '96%',
    height: '96%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
}));

const StyledTaskTittleTypography = styled(Typography)(({ theme }) => ({
    position: 'relative',
    fontWeight: 'bold',
    fontSize: theme.typography.h4.fontSize,
    paddingLeft: theme.spacing(2),
}));

export default function TaskViewer({ taskEntity, breadcrumbsText, reloadProject }) {
    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [task, setTask] = useState(taskEntity);
    const [steps, setSteps] = useState([]);
    const [activeSteps, setActiveSteps] = useState({});
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState(task.name);
    const [isEditing, setIsEditing] = useState(false);

    const taskRef = useRef(null);
    entitySectionIdRef.current[task.ID] = taskRef;

    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
    const handleOpenEditDialog = () => setEditDialogOpen(true);
    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setNewTaskName(task.name); // Reset the name if canceled
    };

    const handleTaskNameChange = (e) => setNewTaskName(e.target.value);

    // Updated handleEditTask function to use changeEntityName
    const handleEditTask = async () => {
        try {
            setIsEditing(true);
            const success = await changeEntityName(task.ID, newTaskName);
            if (success) {
                setTask({ ...task, name: newTaskName });
                reloadProject();
                handleCloseEditDialog();
            } else {
                console.error("Failed to update task name");
                // Optionally add error feedback here
            }
        } catch (error) {
            console.error("Error editing task:", error);
            // Optionally add error feedback here
        } finally {
            setIsEditing(false);
        }
    };

    const handleDeleteTask = async () => {
        try {
            const success = await deleteEntity(task.ID);
            handleCloseDeleteDialog();
            if (success) reloadProject();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const reloadTask = () => {
        getEntity(task.ID).then((t) => setTask(JSON.parse(t)));
    };

    useEffect(() => {
        Promise.all(task.children.map((child) => getEntity(child))).then((steps) => {
            const newSteps = steps.map((s) => JSON.parse(s));
            setSteps(newSteps);
            newSteps.forEach((step) => updateStepActiveStatus(step.ID, false));
        });
    }, [task]);

    const updateStepActiveStatus = (stepId, isActive) => {
        setActiveSteps((prevState) => ({ ...prevState, [stepId]: isActive }));
    };

    useEffect(() => {
        const parsedComments = task.comments.map((comment) =>
            typeof comment === 'string' ? JSON.parse(comment) : comment
        );
        const parsedTask = { ...task, comments: parsedComments };

        if (parsedTask.comments && steps) {
            const sortedContent = sortAndFilterChildren(parsedTask, steps, false);
            setSortedStepsAndContent(sortedContent);
        }
    }, [task, steps]);

    return (
        <Box ref={taskRef} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StyledTaskPaper>
                <StyledEditButton onClick={handleOpenEditDialog} aria-label="edit task">
                    <EditIcon />
                </StyledEditButton>
                <StyledDeleteButton onClick={handleOpenDeleteDialog} aria-label="delete task">
                    <DeleteIcon />
                </StyledDeleteButton>
                <Stack flexGrow={1} spacing={2} direction="column">
                    <Breadcrumbs separator=">" color="#4C9DFC" paddingLeft={2} paddingTop={1}>
                        {breadcrumbsText.map((text) => (
                            <Typography key={text} color="#000000">
                                {text}
                            </Typography>
                        ))}
                    </Breadcrumbs>
                    <StyledTaskTittleTypography>{task.name}</StyledTaskTittleTypography>
                    <Stack flexGrow={1} spacing={2} direction="column" paddingLeft={2}>
                        {sortedStepsAndContent.map((item) => (
                            <Box key={item.ID} display="flex" alignItems="center" width="100%" flexGrow={1}>
                                {item.type ? (
                                    <StepViewer 
                                        stepEntity={item} 
                                        markStepState={updateStepActiveStatus} 
                                        reloadTask={reloadTask} 
                                    />
                                ) : (
                                    <TaskContentViewer 
                                        contentBlock={item} 
                                        entID={task.ID} 
                                        reloadTask={reloadTask} 
                                    />
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </StyledTaskPaper>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit Task Name</DialogTitle>
                <DialogContent>
                    <DialogContentText>Enter the new task name below:</DialogContentText>
                    <Input 
                        value={newTaskName} 
                        onChange={handleTaskNameChange} 
                        fullWidth 
                        autoFocus
                        disabled={isEditing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} disabled={isEditing}>Cancel</Button>
                    <Button 
                        onClick={handleEditTask} 
                        color="primary"
                        disabled={isEditing || !newTaskName.trim() || newTaskName === task.name}
                    >
                        {isEditing ? 'Updating...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Task Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this task? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteTask} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}