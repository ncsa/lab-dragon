"use client"

import { styled } from '@mui/material/styles';
import { Box, Typography, Paper } from "@mui/material";


const StyledProjectPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    backgroundColor: "#CEE5FF",
    width: '90%',
    height: '90%',
    zIndex: theme.zIndex.drawer + 1,
}));

const StyledProjectName = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2),
    color: '#005BC7',
}));

export default function ProjectViewer( { projectEntity} ) {
    console.log("IN PROJECT VIEWER WITH PROPERS");
    console.log(projectEntity);
    return (
        <StyledProjectPaper>
            <StyledProjectName variant="h4" component="h1">{projectEntity.name}</StyledProjectName>
        </StyledProjectPaper>
    )
}
















