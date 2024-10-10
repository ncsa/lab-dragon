"use client"

import { useState, useEffect, useRef } from "react";
import { Typography, Paper, Stack, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import parse from "html-react-parser";


const StyledStepPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F1F8FF',
    width: '90%',
    height: '90%',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '&:hover': {
        backgroundColor: '#D6E4FF',
    },
}))

const StyledStepTittleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
}))

const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
}))

export default function StepViewer( { stepEntity} ) {

    const [isActive, setIsActive] = useState(false);
    const [parsedContentBlocksEnt, setParsedContentBlocksEnt] = useState([]);

    const stepViewerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (stepViewerRef.current && !stepViewerRef.current.contains(event.target)) {
                setIsActive(false);
            }
        };

        if (isActive) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        }
    }, [isActive]);


    useEffect(() => {
        // FIXME: Replace the word comments with contentBlocks once the backend is updated
        const parsedContentBlocksEnt = stepEntity.comments.map(comment => JSON.parse(comment));
        setParsedContentBlocksEnt(parsedContentBlocksEnt)
    }, [])
 
    if (isActive) {
        return (
            <Box ref={stepViewerRef}>
                <Typography>Active baby</Typography>
            </Box>
        )
    } else {
        return (

            <StyledStepPaper
                onClick={() => setIsActive(true)}>
                <StyledStepTittleTypography>{stepEntity.name}</StyledStepTittleTypography>
                <Stack spacing={1} direction="column" paddingTop={2}>
                    {parsedContentBlocksEnt.map(contentBlock => (
                        <StyledStepContentBlocksTypography key={contentBlock.id}>
                            {parse(contentBlock.content[0])}
                        </StyledStepContentBlocksTypography>
                    ))}
                </Stack>
            </StyledStepPaper>
        )
    }
}
























