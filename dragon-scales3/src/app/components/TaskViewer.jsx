"use client"

import { styled } from "@mui/material/styles";
import { Typography, Paper } from "@mui/material";

const StyledTaskPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#FFFFFF",
    width: '90%',
    height: '90%',



}))


export default function TaskViewer({ taskEntity }) {



    return (
        <StyledTaskPaper>
            <Typography>
                {taskEntity.name}
            </Typography>
        </StyledTaskPaper>
    )


}














