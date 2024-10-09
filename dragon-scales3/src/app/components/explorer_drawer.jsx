// TODO: Only 1 thing across all of the trees should be selected at a time. If an item is not selected and the user clicks it once, it should not expand but instead scroll there

"use client";
import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Drawer, Divider, Accordion, AccordionDetails, AccordionActions, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

const drawerWidth = 240;

async function getLibraryStructure(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities?ID=${id}`);
    return await res.json();
}

function createTreeStructure(item) {
    // The first item sent to this function will not be included in the return
    let ret = [];
    if (item.children && item.children.length > 0) {
        ret = item.children.map(child => ({
            id: child.id,
            label: child.name,
            children: createTreeStructure(child)
        }));
    } 
    return ret;
}


const DrawerContent = styled('div')(({ theme }) => ({
    width: drawerWidth,
    marginTop: theme.spacing(2),
  }));

export default function ExplorerDrawer({open, name, id}) {

    const [libraryStructure, setLibraryStructure] = useState([]);
    const [lastClickedItem, setLastClickedItem] = useState(null);

    useEffect(() => {
        getLibraryStructure(id).then(data => {
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
                        <AccordionDetails>
                            <RichTreeView items={createTreeStructure(child)}
                            onItemClick={(event, itemId) => setLastClickedItem(itemId)} />
                        </AccordionDetails>
                    </Accordion>
                ))}
            </DrawerContent>
        </Drawer>
        </Box>
    )
}















