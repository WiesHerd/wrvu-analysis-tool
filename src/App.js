import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, ThemeProvider, createTheme } from '@mui/material';
import ProviderCompensation from './ProviderCompensation';
import WRVUForecastingTool from './WRVUForecastingTool';
import DetailedWRVUForecaster from './DetailedWRVUForecaster';
import { Speed, Analytics, MonetizationOn } from '@mui/icons-material';

// Create a professional theme with standardized typography
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

function App() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [activeRoute, setActiveRoute] = useState(window.location.hash.replace('#', '') || '/');

  const handleUpdateForecast = (newForecast) => {
    console.log('New forecast:', newForecast);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ 
          width: '100%', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          backgroundImage: 'linear-gradient(180deg, rgba(25,118,210,0.04) 0%, rgba(25,118,210,0.01) 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <Box sx={{ 
            width: '100%', 
            background: 'transparent',
            borderBottom: '1px solid rgba(25,118,210,0.12)',
            py: 3,
            mb: 4,
            backgroundColor: 'transparent'
          }}>
            <Container maxWidth="lg">
              <Typography 
                variant="h3" 
                align="center" 
                sx={{ 
                  mb: 4, 
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
                Provider Compensation Calculator
              </Typography>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
                mb: 4,
                width: '100%',
                maxWidth: '800px',
                mx: 'auto',
                px: { xs: 2, sm: 0 }
              }}>
                <Button
                  component={Link}
                  to="/wrvu-forecast"
                  variant="contained"
                  startIcon={<Speed />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '200px' },
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  Quick Forecast
                </Button>
                <Button
                  component={Link}
                  to="/detailed-wrvu"
                  variant="contained"
                  startIcon={<Analytics />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '200px' },
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  Procedure Analysis
                </Button>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  startIcon={<MonetizationOn />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '200px' },
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  Monthly Performance
                </Button>
              </Box>
            </Container>
          </Box>

          <Container maxWidth="lg" sx={{ 
            py: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3 },
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Routes>
              <Route path="/" element={<ProviderCompensation />} />
              <Route path="/quick-wrvu" element={<WRVUForecastingTool setTotalVisits={setTotalVisits} />} />
              <Route 
                path="/advanced-wrvu" 
                element={
                  <DetailedWRVUForecaster 
                    totalVisits={totalVisits} 
                    onUpdateForecast={handleUpdateForecast} 
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
