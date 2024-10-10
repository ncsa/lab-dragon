"use client"

import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {Typography, Paper, Stack, Breadcrumbs, Box} from "@mui/material";
import ViewCompactIcon from '@mui/icons-material/ViewCompact';

import StepViewer from "./StepViewerComponents/StepViewer";
import { getEntity } from "@/app/utils";


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

    const [steps, setSteps] = useState([]);
    const [activeSteps, setActiveSteps] = useState({});

    const updateStepActiveStatus = (stepId, isActive) => {
        setActiveSteps(prevState => ({
            ...prevState,
            [stepId]: isActive
        }));
    };

    useEffect(() => {
        Promise.all(taskEntity.children.map(child => getEntity(child))).then(steps => {
            const newSteps = steps.map(s => JSON.parse(s));
            setSteps(newSteps);
            newSteps.forEach(step => {
                updateStepActiveStatus(step.ID, false);
            })
        })
    }, [taskEntity])

    return (
        <StyledTaskPaper>
            <Typography>{JSON.stringify(activeSteps)}</Typography>
            <Stack flexGrow={1} spacing={2} direction='column'>
                <Breadcrumbs separator=">" color="#4C9DFC" paddingLeft={2} paddingTop={1}>
                    {breadcrumbsText.map(text => (
                        <Typography key={text} color="#000000">
                            {text}
                        </Typography>
                    ))}
                </Breadcrumbs>
                <StyledTaskTittleTypography>
                    {taskEntity.name}
                </StyledTaskTittleTypography>
                <Stack flexGrow={1} spacing={2} direction='column' paddingLeft={2}>
                    {steps.map(step => (
                        <Box key={step.id} display="flex" alignItems="center">
                            {!activeSteps[step.ID] && <ViewCompactIcon />} {/* Conditionally render the icon */}
                            <Box flexGrow={1} paddingLeft={!activeSteps[step.ID] ? 2 : 0}> {/* Adjust padding based on icon presence */}
                                <StepViewer
                                    stepEntity={step}
                                    markStepState={updateStepActiveStatus}
                                />
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </StyledTaskPaper>
    )
}














