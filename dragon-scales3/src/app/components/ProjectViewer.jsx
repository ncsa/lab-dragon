"use client"

import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Typography, Paper, Stack, TextField, IconButton, InputAdornment, Input } from "@mui/material";
import TaskViewer from "@/app/components/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { getEntity } from "@/app/utils";


const StyledProjectPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#CEE5FF",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    // paddingTop: theme.spacing(0.2),
    paddingBottom: theme.spacing(1),
    width: '100%',
    // height: '90%',
    zIndex: theme.zIndex.drawer + 1,
    color: '#005BC7'
}));

const StyledProjectName = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2),
    color: '#005BC7',
}));

export default function ProjectViewer( { projectEntity, notebookName } ) {

    const [topLevelTasks, setTopLevelTasks] = useState([]);

    const project = projectEntity;

    useEffect(() => {
        Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
            const newTopLevelTasks = tasks.map(t => JSON.parse(t));
            setTopLevelTasks(newTopLevelTasks);
        })
    }, [projectEntity])

    return (
        <StyledProjectPaper>
             <Stack direction="row" alignItems="center" justifyContent="space-between">
                <StyledProjectName fontWeight="bold" fontSize="1.5rem">{projectEntity.name}</StyledProjectName>
                <Stack direction="row" spacing={1} alignItems="center">
                <IconButton variant="outlined" color="#FFFFFF">
                        <ChevronLeftIcon />
                </IconButton>
                    <Input
                        variant="filled"
                        size="small"
                        endAdornment={
                            <InputAdornment color="#4C9DFC">
                                <IconButton>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }/>

                </Stack>
            </Stack>
            <Stack flexGrow={1} spacing={2} direction='column' paddingLeft={3}>
                {topLevelTasks.map(task => (
                    <TaskViewer key={task.id} taskEntity={task} breadcrumbsText={[notebookName, projectEntity.name, task.name]} />
                ))}
            </Stack>
        </StyledProjectPaper>
    )
}

// "use client";
// import { useState, useEffect } from "react";
// import { styled } from '@mui/material/styles';
// import { Typography, Paper, TextField, IconButton, Box } from "@mui/material";
// import SearchIcon from '@mui/icons-material/Search';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import TaskViewer from "@/app/components/TaskViewer";
// import { getEntity } from "@/app/utils";

// const StyledProjectPaper = styled(Paper)(({ theme }) => ({
//   backgroundColor: "#CEE5FF",
//   boxShadow: 'none',
//   width: '100%',
//   borderRadius: 0,
//   marginBottom: theme.spacing(2)
// }));

// const StyledHeader = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   padding: theme.spacing(1, 2),
// }));

// const BreadcrumbText = styled(Typography)(({ theme }) => ({
//   color: '#005BC7',
//   display: 'flex',
//   alignItems: 'center',
//   gap: theme.spacing(1),
//   '& > span': {
//     fontSize: '14px'
//   }
// }));

// const StyledSearchField = styled(TextField)(({ theme }) => ({
//   '& .MuiOutlinedInput-root': {
//     backgroundColor: 'white',
//     '& fieldset': {
//       borderColor: '#E0E0E0',
//     },
//     '&:hover fieldset': {
//       borderColor: '#005BC7',
//     },
//     '&.Mui-focused fieldset': {
//       borderColor: '#005BC7',
//     },
//   },
//   '& .MuiOutlinedInput-input': {
//     padding: theme.spacing(1),
//     paddingLeft: theme.spacing(4),
//   },
// }));

// const SearchIconWrapper = styled('div')(({ theme }) => ({
//   position: 'absolute',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   left: theme.spacing(1),
//   top: '50%',
//   transform: 'translateY(-50%)',
//   color: '#757575',
//   zIndex: 1,
// }));

// export default function ProjectViewer({ projectEntity, notebookName }) {
//   const [topLevelTasks, setTopLevelTasks] = useState([]);
//   const project = projectEntity;

//   useEffect(() => {
//     if (project && project.children) {
//       Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
//         const newTopLevelTasks = tasks.map(t => JSON.parse(t));
//         setTopLevelTasks(newTopLevelTasks);
//       });
//     }
//   }, [projectEntity]);

//   return (
//     <Box sx={{ width: '100%' }}>
//       <StyledProjectPaper>
//         <StyledHeader>
//           <BreadcrumbText>
//             <ChevronLeftIcon sx={{ color: '#005BC7' }} />
//             <span>{notebookName}</span>
//             <span>&gt;</span>
//             <span>{projectEntity?.name}</span>
//           </BreadcrumbText>
//           <Box sx={{ position: 'relative' }}>
//             <SearchIconWrapper>
//               <SearchIcon fontSize="small" />
//             </SearchIconWrapper>
//             <StyledSearchField
//               placeholder="Search"
//               variant="outlined"
//               size="small"
//             />
//           </Box>
//         </StyledHeader>
//       </StyledProjectPaper>
//       <Box>
//         {topLevelTasks.map(task => (
//           <TaskViewer 
//             key={task.id} 
//             taskEntity={task} 
//             breadcrumbsText={[notebookName, projectEntity?.name, task.name || '']} // Pass an array safely
//           />
//         ))}
//       </Box>
//     </Box>
//   );
// }
