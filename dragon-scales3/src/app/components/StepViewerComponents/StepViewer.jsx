"use client"

import {useEffect, useRef, useState} from "react";
import {Box, Paper, Stack, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";
import parse from "html-react-parser";
import ActiveStepContentBlock from "@/app/components/StepViewerComponents/ActiveStepContentBlock";


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

    const [entity, setEntity] = useState(stepEntity);
    const [isActive, setIsActive] = useState(false);
    // const [activeContentBlock, setActiveContentBlock] = useState(null);
    const [parsedContentBlocksEnt, setParsedContentBlocksEnt] = useState([]);

    // Holds as keys the ids of contentBlocks and as values their corresponding refs
    const contentBlocksRefs = useRef({});
    const activeContentBlockRef = useRef(null);

    const stepViewerRef = useRef(null); // used to keep track of active state
    
    const updateContentBlocksRefs = (id, text) => {
        contentBlocksRefs[id] = text;
    }
    
    const activateStepViewer = () => {
        setIsActive(true);
        markStepState(stepEntity.ID, true);
    }

    const deactivateStepViewer = () => {
        setIsActive(false);
        markStepState(stepEntity.ID, false);
        console.log("here comes the current text at deactivation")
        console.log(contentBlocksRefs.current)

        console.log(contentBlocksRefs[activeContentBlockRef])
        activeContentBlockRef.current = null;
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (stepViewerRef.current && !stepViewerRef.current.contains(event.target)) {
                deactivateStepViewer();
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
        contentBlocksRefs.current = parsedContentBlocksEnt.reduce((acc, contentBlock) => {
            acc[contentBlock.ID] = contentBlock.content[0];
            return acc;
        }, {});
    }, [stepEntity])
 
    if (isActive) {
        return (
            <Box ref={stepViewerRef}>
                <StyledStepPaperActive>
                    <StyledStepTittleTypography paddingLeft={3}>{stepEntity.name}</StyledStepTittleTypography>
                    {parsedContentBlocksEnt.map(contentBlock => (
                       <ActiveStepContentBlock key={contentBlock.ID}
                                               contentBlock={contentBlock}
                                               entID={stepEntity.ID}
                                               activeContentBlockRef={contentBlocksRefs}
                                               updateContent={updateContentBlocksRefs} />
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
                        <StyledStepContentBlocksTypography key={contentBlock.ID}>
                            {parse(contentBlock.content[0])}
                        </StyledStepContentBlocksTypography>
                    ))}
                </Stack>
            </StyledStepPaper>
        )
    }
}
























