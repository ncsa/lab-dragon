"use client";
import { Box, Typography, Container, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const MainContent = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10),
  },
  display: 'grid',
  gridTemplateRows: '20px 1fr 20px',
  alignItems: 'center',
  justifyItems: 'center',
  gap: theme.spacing(8),
}));

const ContentStack = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gridRow: 2,
  gap: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    alignItems: 'flex-start',
  },
}));

const WelcomeStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}));

export default function Library() {

  return (
    <Container>
      <MainContent>
        <ContentStack>
          <Typography variant="h1" component="h1">
            <b>Lab Dragon</b>
          </Typography>
          <WelcomeStack>
            <Typography variant="h3">Welcome! The landing page is currently under construction, please select a <em>Library</em> on the toolbar to your left</Typography>
          </WelcomeStack>
        </ContentStack>
      </MainContent>
    </Container>
  );
}