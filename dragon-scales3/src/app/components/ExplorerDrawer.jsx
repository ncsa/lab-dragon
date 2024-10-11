"use client";

// TODO: Only 1 thing across all of the trees should be selected at a time. If an item is not selected and the user clicks it once, it should not expand but instead scroll there

import { useEffect, useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Drawer, Divider, Accordion, AccordionDetails, IconButton, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import { ExplorerContext } from '../contexts/explorerContext';
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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: '#4C9DFC',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  width: '100%',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(0.5),
  border: '1px solid white',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

const DrawerContent = styled('div')(({ theme }) => ({
  width: drawerWidth,
  height: '100%',
  backgroundColor: '#4C9DFC',
  color: 'white',
  padding: theme.spacing(0, 2, 2),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: 'black',
  // boxShadow: 'none',
  // border: "1px solid white",
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: theme.spacing(0, 1),
    minHeight: 48,
    '& .MuiAccordionSummary-expandIconWrapper': {
      color: 'black',
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(1, 2, 2),
  },
}));

const StyledTreeView = styled(RichTreeView)(({ theme }) => ({
  color: 'black',
  '& .MuiTreeItem-content': {
    padding: theme.spacing(0.5, 0),
  },
  '& .MuiTreeItem-label': {
    fontSize: '0.875rem',
  },
}));

export default function ExplorerDrawer({open, name, id}) {
  const { setDrawerOpen, setCurrentlySelectedItem } = useContext(ExplorerContext);
  const [libraryStructure, setLibraryStructure] = useState([]);

  useEffect(() => {
    getLibraryStructure(id).then(data => {
      setLibraryStructure(data);
    });
  }, [id]);

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginLeft: '64px',
          border: 'none',
          backgroundColor: '#4C9DFC',
          overflowX: 'hidden',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader>
        <IconContainer>
          <StyledIconButton>
            <SortIcon />
          </StyledIconButton>
          <StyledIconButton>
            <SearchIcon />
          </StyledIconButton>
          <StyledIconButton>
            <AddIcon />
          </StyledIconButton>
          <StyledIconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeftIcon />
          </StyledIconButton>
        </IconContainer>
      </DrawerHeader>
      <DrawerContent>
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 2 }}>
          {name}
        </Typography>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
        {libraryStructure.children && libraryStructure.children.map(child => (
          <StyledAccordion key={child.id} TransitionProps={{ timeout: 300 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{child.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <StyledTreeView
                items={createTreeStructure(child)}
                onItemClick={(event, itemId) => setCurrentlySelectedItem(itemId)}
              />
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </DrawerContent>
    </Drawer>
  );
}