"use client"

import {useState, useRef, useEffect} from "react";
import {styled} from "@mui/material/styles";
import {Box, Typography} from "@mui/material";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import parse from "html-react-parser";

const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    cursor: 'default',
}))

const StyledContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    '&:hover': {
        backgroundColor: '#bec1ca',
    }

}))

export default function TaskContentViewer( { contentBlock, entID } ) {
    const [isActive, setActive] = useState(false)

    const contentBlockRef = useRef(null); // used to track active state
    const textRef = useRef(contentBlock.content[contentBlock.content.length - 1]); // used to track editor text

    const handleContentChange = (content) => {
        textRef.current = content;
    }

    const activateContentBlock = (event) => {
        setActive(true);
    }

    const deactivateContentBlock = () => {
        setActive(false);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentBlockRef.current && !contentBlockRef.current.contains(event.target)) {
                deactivateContentBlock()
            }
        };

        if (isActive) {
            document.addEventListener("click", handleClickOutside)
        }
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isActive])

    if (isActive) {
        return (
            <StyledContentBox ref={contentBlockRef}>
                <Box marginRight={2}>
                    <ViewCompactIcon/>
                </Box>
                <Tiptap onContentChange={handleContentChange}
                        entID={entID}
                        initialContent={textRef.current} />
            </StyledContentBox>
        )
    } else {
        return (

            <StyledContentBox onClick={activateContentBlock} ref={contentBlockRef}>
                <Box marginRight={2} cursor="pointer">
                    <ViewCompactIcon cursor="pointer"/>
                </Box>
                <StyledStepContentBlocksTypography key={contentBlock.ID}>
                    {parse(contentBlock.content[contentBlock.content.length - 1])}
                </StyledStepContentBlocksTypography>
            </StyledContentBox>
        )
    }

}







