"use client"

import {useEffect, useRef, useState, useContext} from "react";
import {Box, Button, Divider, Paper, Stack, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";
import parse from "html-react-parser";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";

import ActiveStepContentBlock from "@/app/components/StepViewerComponents/ActiveStepContentBlock";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import {ExplorerContext} from "@/app/contexts/explorerContext";


import {getEntity, submitContentBlockEdition, submitNewContentBlock} from "@/app/utils";

const StyledStepPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F1F8FF',
    width: '96%',
    height: '90%',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '&:hover': {
        backgroundColor: '#D6E4FF',
        cursor: 'pointer',
    },
}))

const StyledStepPaperActive = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e0e9ff',
    width: '96%',
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

const StyledNewContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingTop: "10px"

}))


export default function StepViewer( { stepEntity, markStepState} ) {

    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [step, setStep] = useState(stepEntity);
    const [isActive, setIsActive] = useState(false);
    const [parsedContentBlocksEnt, setParsedContentBlocksEnt] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);

    // Holds as keys the ids of contentBlocks and as values their corresponding refs
    const contentBlocksRefs = useRef({});
    const activeContentBlockRef = useRef(null);
    const newContentBlockRef = useRef(null);  // Used to keep track of the up-to-date content of tiptap
    const stepViewerRef = useRef(null); // used to keep track of active state
    const stepRef = useRef(null);

    entitySectionIdRef.current[step.ID] = stepRef;

    const handleNewContentChange = (content) => {
        newContentBlockRef.current = content;
    }

    const updateContentBlocksRefs = (id, text) => {
        contentBlocksRefs.current[id] = text;
    }
    
    const activateStepViewer = () => {
        setIsActive(true);
        markStepState(step.ID, true);
    }

    const deactivateStepViewer = () => {
        setIsActive(false);
        markStepState(step.ID, false);

        const contBlock = parsedContentBlocksEnt.find(block => block.ID === activeContentBlockRef.current)
        const newContent = contentBlocksRefs.current[activeContentBlockRef.current]

        if (newContent && contBlock) {
            // FIXME: Change the user here to use the context of the selected user
            // FIXME: there is probably a more efficient way of finding the contentBlock but oh well
            const success = submitContentBlockEdition(
                step.ID,
                "marcos",
                contBlock,
                newContent,
            ).then(response => {
                    if (success) {
                        activeContentBlockRef.current = null;
                        getEntity(step.ID).then(entity => {
                            setStep(JSON.parse(entity));
                        })
                    } else {
                        console.log("Error: content block edition failed")
                    }
                }
            )
        }
    }

    const handleSubmitNewContent = (e) => {
        e.preventDefault();
        const newContent = newContentBlockRef.current;
        if (newContent) {
            const success = submitNewContentBlock(step.ID, "marcos", newContent).then(response => {
                if (success) {
                    getEntity(step.ID).then(entity => {
                        newContentBlockRef.current = null;
                        setReloadEditor(prev => prev+1);
                        setStep(JSON.parse(entity));
                    })
                } else {
                    console.log("Error: new content block submission failed")
                }
            })
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
        const parsedContentBlocksEnt = step.comments.map(comment => JSON.parse(comment));
        setParsedContentBlocksEnt(parsedContentBlocksEnt)
        contentBlocksRefs.current = parsedContentBlocksEnt.reduce((acc, contentBlock) => {
            acc[contentBlock.ID] = contentBlock.content[contentBlock.content.length - 1];
            return acc;
        }, {});
    }, [step])
 
    if (isActive) {
        return (
            <Box ref={stepRef} flexGrow={1}>
            <Box ref={stepViewerRef} flexGrow={1} display="flex" alignItems="center">
                <StyledStepPaperActive>
                    <StyledStepTittleTypography paddingLeft={5}>{step.name}</StyledStepTittleTypography>
                        {parsedContentBlocksEnt.map(contentBlock => (
                           <ActiveStepContentBlock key={contentBlock.ID}
                                                   contentBlock={contentBlock}
                                                   entID={step.ID}
                                                   activeContentBlockRef={activeContentBlockRef}
                                                   updateContent={updateContentBlocksRefs} />
                        ))}
                        <Divider sx={{paddingTop: "5px",}} />
                        <form noValidate autoComplete="off" onSubmit={handleSubmitNewContent}>
                            <StyledNewContentBox>
                                <Box marginRight={2}>
                                    <ViewCompactIcon />
                                </Box>

                                <Tiptap onContentChange={handleNewContentChange}
                                        entID={step.ID}
                                        initialContent={newContentBlockRef.current}
                                        reloadEditor={reloadEditor}
                                        placeholder="Write a new content block here..."
                                        newLineEditor={true} />

                                <Button type="submit"
                                        variant="contained"
                                        size="small"
                                        sx={{ marginLeft: 1,
                                            marginRight: 1
                                        }}
                                        >
                                    Submit
                                </Button>
                            </StyledNewContentBox>
                        </form>

                    </StyledStepPaperActive>
                </Box>
            </Box>
        )
    } else {
        return (
            <Box ref={stepRef} flexGrow={1}>
                <StyledStepPaper
                    onClick={() => activateStepViewer()}>
                    <Box flexGrow={1} display="flex" alignItems="center">
                        <Box marginRight={2}>
                            <ViewCompactIcon />
                        </Box>
                        <Box>
                            <StyledStepTittleTypography>{step.name}</StyledStepTittleTypography>
                            <Stack spacing={1} direction="column" paddingTop={2}>
                                {parsedContentBlocksEnt.map(contentBlock => (
                                    <StyledStepContentBlocksTypography key={contentBlock.ID}>
                                        {parse(contentBlock.content[contentBlock.content.length - 1])}
                                    </StyledStepContentBlocksTypography>
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </StyledStepPaper>
            </Box>
        )
    }
}
























