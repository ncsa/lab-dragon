"use client"

import { styled } from "@mui/material/styles";
import {Typography, Paper, Stack, Breadcrumbs} from "@mui/material";

const StyledTaskPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#FFFFFF",
    width: '90%',
    height: '90%',
}))

const StyledTaskTittleTypography  = styled(Typography)(({ theme }) => ({
    position: 'relative',
    fontWeight: 'bold',
    fontSize: theme.typography.h4.fontSize,
paddingLeft: theme.spacing(2),
}))


export default function TaskViewer({ taskEntity, breadcrumbsText }) {

    console.log(breadcrumbsText)
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
            </Stack>
        </StyledTaskPaper>
    )


}














