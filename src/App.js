import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ProviderCompensation from './ProviderCompensation';
import WRVUForecastingTool from './WRVUForecastingTool';
import DetailedWRVUForecaster from './DetailedWRVUForecaster';

const drawerWidth = 240;

function SideMenu() {
  const location = useLocation();

  const menuItems = [
    { text: 'Compensation Estimator', icon: <HomeIcon />, path: '/' },
    { text: 'Quick wRVU Estimator', icon: <BarChartIcon />, path: '/forecast' },
    { text: 'Advanced wRVU Analysis', icon: <AssessmentIcon />, path: '/detailed-forecast' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: '100vh',
        backgroundColor: 'white',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ p: 2, color: '#1976d2', fontWeight: 'bold' }}>
        Menu
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            sx={{
              color: location.pathname === item.path ? '#1976d2' : 'inherit',
              backgroundColor: location.pathname === item.path ? '#e3f2fd' : 'transparent',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              borderRadius: '0 20px 20px 0',
              mr: 2,
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function App() {
  const [totalVisits, setTotalVisits] = useState(0); // Initialize with a default value

  const handleUpdateForecast = (newForecast) => {
    // Handle the updated forecast here
    console.log('New forecast:', newForecast);
    // You might want to update some state or perform other actions
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<ProviderCompensation />} />
              <Route path="/forecast" element={<WRVUForecastingTool setTotalVisits={setTotalVisits} />} />
              <Route 
                path="/detailed-forecast" 
                element={
                  <DetailedWRVUForecaster 
                    totalVisits={totalVisits} 
                    onUpdateForecast={handleUpdateForecast} 
                  />
                } 
              />
              {/* Add a route for Settings if needed */}
            </Routes>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;