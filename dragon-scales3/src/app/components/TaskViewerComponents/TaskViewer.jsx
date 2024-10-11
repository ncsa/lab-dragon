"use client"

import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {Typography, Paper, Stack, Breadcrumbs, Box} from "@mui/material";
import ViewCompactIcon from '@mui/icons-material/ViewCompact';

import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import {getEntity, sortAndFilterChildren} from "@/app/utils";


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


export default function TaskViewer({ taskEntity, breadcrumbsText }) {

    const [task, setTask] = useState(taskEntity);
    const [steps, setSteps] = useState([]);
    const [activeSteps, setActiveSteps] = useState({});
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);


    const updateStepActiveStatus = (stepId, isActive) => {
        setActiveSteps(prevState => ({
            ...prevState,
            [stepId]: isActive
        }));
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
        const parsedCommentsTask = {...task, comments: parsedComments};
        // setTask(parsedCommentsTask);

        if (parsedCommentsTask.comments && steps) {
            const sortedAndFiltered = sortAndFilterChildren(parsedCommentsTask, steps, false);
            setSortedStepsAndContent(sortedAndFiltered);
        }


    }, [task, steps])

    console.log("final version of sortedStepsAndContent", typeof sortedStepsAndContent)
    console.log(sortedStepsAndContent);
    return (
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
                        <Box key={item.id} display="flex" alignItems="center">
                                {item.type ? (
                                    // <Box flexGrow={1} display="flex" alignItems="center" paddingLeft={!activeSteps[item.ID] ? 2 : 0}> {/* Adjust padding based on icon presence */}
                                    //     {!activeSteps[item.ID] && <ViewCompactIcon />} {/* Conditionally render the icon */}
                                    <StepViewer
                                        stepEntity={item}
                                        markStepState={updateStepActiveStatus}/>
                                    // </Box>
                                ) : (
                                    <Box marginLeft={2}>
                                        <TaskContentViewer
                                            contentBlock={item}
                                            entID={task.ID}
                                        />
                                    </Box>
                                )}
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </StyledTaskPaper>
    )
}














