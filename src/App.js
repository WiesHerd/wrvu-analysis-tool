import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import ProviderCompensation from './ProviderCompensation';
import WRVUForecastingTool from './WRVUForecastingTool';
import DetailedWRVUForecaster from './DetailedWRVUForecaster';

function NavigationButtons() {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
      <Button 
        component={Link} 
        to="/" 
        variant="contained" 
        color="primary"
      >
        Monthly Trending
      </Button>
      <Button 
        component={Link} 
        to="/quick-wrvu" 
        variant="contained" 
        color="primary"
      >
        Average wRVU per Encounter
      </Button>
      <Button 
        component={Link} 
        to="/advanced-wrvu" 
        variant="contained" 
        color="primary"
      >
        Code Detail
      </Button>
    </Box>
  );
}

function App() {
  const [totalVisits, setTotalVisits] = useState(0);

  const handleUpdateForecast = (newForecast) => {
    console.log('New forecast:', newForecast);
    // Handle the forecast update here
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              Provider Compensation Forecaster
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <NavigationButtons />
          
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
        
        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Provider Compensation Forecaster. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
