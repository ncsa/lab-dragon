"use client";
import { useSearchParams } from 'next/navigation';
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

export default function Library() {
  const searchParams = useSearchParams();

  return (
    <Container>
      <MainContent>
        <ContentStack>
          <Typography variant="h4" component="h1">
            Search Page
          </Typography>
        </ContentStack>
      </MainContent>
    </Container>
  );
}