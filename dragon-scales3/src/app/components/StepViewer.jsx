"use client"

import { useState, useEffect, useRef } from "react";
import { Typography, Paper, Stack, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import parse from "html-react-parser";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import CropSquareIcon from '@mui/icons-material/CropSquare';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';


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

const StyledStepPaperActive = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e0e9ff',
    width: '90%',
    height: '90%',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    
}))

const StyledStepTittleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
}))

const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
}))

export default function StepViewer( { stepEntity, markStepState} ) {

    const [isActive, setIsActive] = useState(false);
    const [parsedContentBlocksEnt, setParsedContentBlocksEnt] = useState([]);

    const stepViewerRef = useRef(null); // used to keep track of active state
    // used to keep track of the current existing text in the tiptap editor
    const currentEditorText = useRef(null);

    const handleContentChange = (content) => {
        currentEditorText.current = content;
    }

    const activateStepViewer = () => {
        setIsActive(true);
        markStepState(stepEntity.ID, true);
    }

    const deactivateStepViewer = () => {
        setIsActive(false);
        markStepState(stepEntity.ID, false);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (stepViewerRef.current && !stepViewerRef.current.contains(event.target)) {
                deactivateStepViewer()
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
                <StyledStepPaperActive>
                    <StyledStepTittleTypography paddingLeft={3}>{stepEntity.name}</StyledStepTittleTypography>
                    {parsedContentBlocksEnt.map(contentBlock => (
                        <Box key={contentBlock.id} display="flex" alignItems="center">
                            <Box marginRight={2}>
                                <ViewCompactIcon />
                            </Box>
                            <StyledStepContentBlocksTypography key={contentBlock.id}>
                                {parse(contentBlock.content[0])}
                            </StyledStepContentBlocksTypography>
                        </Box>
                    ))}
                </StyledStepPaperActive>
            </Box>
        )
    } else {
        return (
            <StyledStepPaper
                onClick={() => activateStepViewer()}>
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
























