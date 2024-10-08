"use client";
import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Drawer, Divider, Accordion, AccordionActions, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

async function getLibraryStructure(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities?ID=${id}`);
    return await res.json();
}


const DrawerContent = styled('div')(({ theme }) => ({
    width: drawerWidth,
    marginTop: theme.spacing(2),
  }));

export default function ExplorerDrawer({open, name, id}) {

    const [libraryStructure, setLibraryStructure] = useState([]);

    useEffect(() => {
        console.log(name, id);
        getLibraryStructure(id).then(data => {
            console.log("Here comes the data");
            console.log(data);
            setLibraryStructure(data);
        });
    }, []);

    return(
        <Box>
        <Drawer
            sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                marginLeft: '64px',
                paddingTop: '20px',
            },
            }}
            variant="persistent"
            anchor="left"
            open={open}>
            <DrawerContent>
                <Typography variant="h4">{name}</Typography>
                <Divider />
                {libraryStructure.children && libraryStructure.children.map(child => (
                    <Accordion key={child.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        {child.name}
                        </AccordionSummary>
                    </Accordion>
                ))}
            </DrawerContent>
        </Drawer>
        </Box>
    )
}















