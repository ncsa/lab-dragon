"use client"

import {useEffect, useRef, useState} from "react";
import {Box, Paper, Stack, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";
import parse from "html-react-parser";

import { getEntity } from "@/app/utils";
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


async function submitContentBlockEdition(entID, user, contentBlock, newContent) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + entID + "/" + contentBlock.ID + "?HTML=True&username=" + user, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}


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
        contentBlocksRefs.current[id] = text;
    }
    
    const activateStepViewer = () => {
        setIsActive(true);
        markStepState(entity.ID, true);
    }

    const deactivateStepViewer = () => {
        setIsActive(false);
        markStepState(entity.ID, false);

        const contBlock = parsedContentBlocksEnt.find(block => block.ID === activeContentBlockRef.current)
        const newContent = contentBlocksRefs.current[activeContentBlockRef.current]

        if (newContent && contBlock) {
            // FIXME: Change the user here to use the context of the selected user
            // FIXME: there is probably a more efficient way of finding the contentBlock but oh well
            const success = submitContentBlockEdition(
                entity.ID,
                "marcos",
                contBlock,
                newContent,
            ).then(response => {
                    if (success) {
                        activeContentBlockRef.current = null;
                        getEntity(entity.ID).then(entity => {
                            setEntity(JSON.parse(entity));
                        })
                    } else {
                        console.log("Error: content block edition failed")
                    }
                }
            )
        }
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
        const parsedContentBlocksEnt = entity.comments.map(comment => JSON.parse(comment));
        setParsedContentBlocksEnt(parsedContentBlocksEnt)
        contentBlocksRefs.current = parsedContentBlocksEnt.reduce((acc, contentBlock) => {
            acc[contentBlock.ID] = contentBlock.content[contentBlock.content.length - 1];
            return acc;
        }, {});
    }, [entity])
 
    if (isActive) {
        return (
            <Box ref={stepViewerRef}>
                <StyledStepPaperActive>
                    <StyledStepTittleTypography paddingLeft={3}>{entity.name}</StyledStepTittleTypography>
                    {parsedContentBlocksEnt.map(contentBlock => (
                       <ActiveStepContentBlock key={contentBlock.ID}
                                               contentBlock={contentBlock}
                                               entID={entity.ID}
                                               activeContentBlockRef={activeContentBlockRef}
                                               updateContent={updateContentBlocksRefs} />
                    ))}
                </StyledStepPaperActive>
            </Box>
        )
    } else {
        return (
            <StyledStepPaper
                onClick={() => activateStepViewer()}>
                <StyledStepTittleTypography>{entity.name}</StyledStepTittleTypography>
                <Stack spacing={1} direction="column" paddingTop={2}>
                    {parsedContentBlocksEnt.map(contentBlock => (
                        <StyledStepContentBlocksTypography key={contentBlock.ID}>
                            {parse(contentBlock.content[contentBlock.content.length - 1])}
                        </StyledStepContentBlocksTypography>
                    ))}
                </Stack>
            </StyledStepPaper>
        )
    }
}
























