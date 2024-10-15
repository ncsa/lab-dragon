"use client"
import { useState, useEffect, useRef, useContext } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Paper, Stack, Breadcrumbs, Box, Divider, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import DeleteIcon from '@mui/icons-material/Delete';
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import {deleteEntity, getEntity, sortAndFilterChildren, submitNewContentBlock} from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import { ExplorerContext } from "@/app/contexts/explorerContext";

const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    color: theme.palette.error.main,
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
}))

const StyledTaskTittleTypography = styled(Typography)(({ theme }) => ({
    position: 'relative',
    fontWeight: 'bold',
    fontSize: theme.typography.h4.fontSize,
    paddingLeft: theme.spacing(2),
}))

const StyledNewContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingTop: "10px",
    width: "96%",
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2)

}))

export default function TaskViewer({ taskEntity, breadcrumbsText, reloadProject }) {

    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [task, setTask] = useState(taskEntity);
    const [steps, setSteps] = useState([]);
    const [activeSteps, setActiveSteps] = useState({});
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const taskRef = useRef(null);
    const newContentBlockRef = useRef(null);

    entitySectionIdRef.current[task.ID] = taskRef;

    const handleOpenNewEntityDialog = () => {
        setNewEntityDialogOpen(true);
    }

    const handleCloseNewEntityDialog = () => {
        setNewEntityDialogOpen(false);
    }

    const handleNewContentBlockChange = (content) => {
        newContentBlockRef.current = content;
    }

    const handleSubmitNewContent = (e) => {
        e.preventDefault()
        const newContent = newContentBlockRef.current;
        if (newContent) {
            const success = submitNewContentBlock(task.ID, "marcos", newContent).then(() => {
                if (success) {
                    newContentBlockRef.current = null;
                    setReloadEditor(reloadEditor + 1);
                    reloadTask();
                } else {
                    console.error("Error submitting content block edition");
                }
            })
        }
    }

    const updateStepActiveStatus = (stepId, isActive) => {
        setActiveSteps(prevState => ({
            ...prevState,
            [stepId]: isActive
        }));
    };

    const reloadTask = () => {
        getEntity(task.ID).then(t => {
            setTask(JSON.parse(t));
        })
    }

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteTask = async () => {
        try {
            const success = await deleteEntity(task.ID);
            handleCloseDeleteDialog();
            if (success) {
                reloadProject();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // Loads the children
    useEffect(() => {
        Promise.all(task.children.map(child => getEntity(child))).then(steps => {
            const newSteps = steps.map(s => JSON.parse(s));
            setSteps(newSteps);
            newSteps.forEach(step => {
                updateStepActiveStatus(step.ID, false);
            })
        })
    }, [task])

    // Sorts the children with content blocks
    useEffect(() => {
        // goes through task.comments parsing any strings
        const parsedComments = task.comments.map(comment => typeof comment === 'string' ? JSON.parse(comment) : comment);
        // using a new variables instead of state because I cannot guarantee that state updates in time
        const parsedCommentsTask = { ...task, comments: parsedComments };

        if (parsedCommentsTask.comments && steps) {
            const sortedAndFiltered = sortAndFilterChildren(parsedCommentsTask, steps, false);
            setSortedStepsAndContent(sortedAndFiltered);
        }
    }, [task, steps])

    return (
        <Box ref={taskRef} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StyledTaskPaper>
                <StyledDeleteButton onClick={handleOpenDeleteDialog} aria-label="delete task">
                    <DeleteIcon />
                </StyledDeleteButton>
                <Stack flexGrow={1} spacing={2} direction='column'>
                    <Breadcrumbs separator=">" color="#4C9DFC" paddingLeft={2} paddingTop={1}>
                        {breadcrumbsText.map(text => (
                            <Typography key={text} color="#000000">
                                {text}
                            </Typography>
                        ))}
                    </Breadcrumbs>
                    <StyledTaskTittleTypography>
                        {task.name}
                    </StyledTaskTittleTypography>
                    <Stack flexGrow={1} spacing={2} direction='column' paddingLeft={2}>
                        {sortedStepsAndContent.map(item => (
                            <Box key={item.ID} display="flex" alignItems="center" width="100%" flexGrow={1}>
                                {item.type ? (
                                    <StepViewer style={{ flexGrow: 1 }}
                                                stepEntity={item}
                                                markStepState={updateStepActiveStatus}
                                                reloadTask={reloadTask}/>
                                ) : (
                                    <Box marginLeft={2} flexGrow={1}>
                                        <TaskContentViewer
                                            contentBlock={item}
                                            entID={task.ID}
                                            reloadTask={reloadTask}
                                        />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Stack>
                    <form noValidate autoComplete="off" onSubmit={handleSubmitNewContent}>
                        <StyledNewContentBox marginBottom={1}>
                            <Box marginRight={2}>
                                <ViewCompactIcon />
                            </Box>
                            <Tiptap onContentChange={handleNewContentBlockChange}
                                    entID={task.ID}
                                    initialContent={newContentBlockRef.current}
                                    reloadEditor={reloadEditor}
                                    placeholder={`Add content block to "${task.name}" here...`}
                                    newLineEditor={true} />
                            <Button type="submit"
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        marginLeft: 1,
                                        marginRight: 1
                                    }}
                            >
                                Submit
                            </Button>
                        </StyledNewContentBox>
                    </form>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Divider sx={{ width: "90%", margin: "auto", }} />
                        <IconButton aria-label="add new entity"
                                    sx={{ paddingTop: 1 }}
                                    onClick={handleOpenNewEntityDialog}>
                            <AddBoxOutlinedIcon titleAccess="Add new entity" />
                        </IconButton>
                    </Box>
                </Stack>
            </StyledTaskPaper>
            <NewEntityDialog
                user="marcos"
                type="Step"
                parentName={task.name}
                parentID={task.ID}
                open={newEntityDialogOpen}
                onClose={handleCloseNewEntityDialog}
                reloadParent={reloadTask}
            />
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Task Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
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
    )
}
