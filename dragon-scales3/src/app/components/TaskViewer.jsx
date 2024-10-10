"use client"

import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {Typography, Paper, Stack, Breadcrumbs} from "@mui/material";

import StepViewer from "./StepViewer";
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

    useEffect(() => {
        Promise.all(taskEntity.children.map(child => getEntity(child))).then(steps => {
            const newSteps = steps.map(s => JSON.parse(s));
            setSteps(newSteps);
        })
    }, [taskEntity])

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
                    {taskEntity.name}
                </StyledTaskTittleTypography>
                <Stack flexGrow={1} spacing={2} direction='column' paddingLeft={2}>
                    {steps.map(step => (
                        <StepViewer key={step.id} stepEntity={step} />
                    ))}
                </Stack>
            </Stack>
        </StyledTaskPaper>
    )
}














