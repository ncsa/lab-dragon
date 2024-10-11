"use client"

import { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import {Typography, Paper, Stack, Breadcrumbs, Box, Divider, IconButton, Button} from "@mui/material";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";

import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import {getEntity, sortAndFilterChildren, submitNewContentBlock} from "@/app/utils";
import NewEntityDialog from "@/app/components/NewEntityDialog";


const StyledTaskPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#FFFFFF",
    width: '90%',
    height: '90%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
}))

const StyledTaskTittleTypography  = styled(Typography)(({ theme }) => ({
    position: 'relative',
    fontWeight: 'bold',
    fontSize: theme.typography.h4.fontSize,
    paddingLeft: theme.spacing(2),
}))

const StyledNewContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingTop: "10px",
    width: "90%",
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2)

}))

export default function TaskViewer({ taskEntity, breadcrumbsText }) {

    const [task, setTask] = useState(taskEntity);
    const [steps, setSteps] = useState([]);
    const [activeSteps, setActiveSteps] = useState({});
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);

    const newContentBlockRef = useRef(null);

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
        const parsedCommentsTask = {...task, comments: parsedComments};

        if (parsedCommentsTask.comments && steps) {
            const sortedAndFiltered = sortAndFilterChildren(parsedCommentsTask, steps, false);
            setSortedStepsAndContent(sortedAndFiltered);
        }


    }, [task, steps])

    return (
        <Box>
            <StyledTaskPaper>
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
                            <Box key={item.ID} display="flex" alignItems="center">
                                {item.type ? (
                                    <StepViewer
                                        stepEntity={item}
                                        markStepState={updateStepActiveStatus}/>
                                ) : (
                                    <Box marginLeft={2}>
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
                                <ViewCompactIcon/>
                            </Box>
                            <Tiptap onContentChange={handleNewContentBlockChange}
                                    entID={task.ID}
                                    initialContent={newContentBlockRef.current}
                                    reloadEditor={reloadEditor}
                                    placeholder={`Add content block to "${task.name}" here...`}
                                    newLineEditor={true}/>

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
                        <Divider sx={{width: "90%", margin: "auto",}}/>
                        <IconButton aria-label="add new entity"
                                    sx={{paddingTop: 1}}
                                    onClick={handleOpenNewEntityDialog}>
                            <AddBoxOutlinedIcon titleAccess="Add new entity"/>
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
        </Box>
    )
}














