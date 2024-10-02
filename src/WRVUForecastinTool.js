import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, Typography, TextField, Select, MenuItem,
  InputLabel, FormControl, Box, Tabs, Tab, InputAdornment
} from '@mui/material';
import { Line } from 'react-chartjs-2';

const timePeriods = {
  daily: 1, weekly: 5, monthly: 20, quarterly: 60, annually: 240
};

function WRVUForecastingTool() {
  const [inputs, setInputs] = useState({
    dailyVisits: 20,
    avgWRVU: 1.5,
    conversionFactor: 45.52,
    basePay: 150000,
    timePeriod: 'annually'
  });
  const [projections, setProjections] = useState(null);

  useEffect(() => {
    calculateProjections();
  }, [inputs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const calculateProjections = () => {
    const { dailyVisits, avgWRVU, conversionFactor, basePay, timePeriod } = inputs;
    const totalWRVUs = dailyVisits * avgWRVU * timePeriods[timePeriod];
    const totalCompensation = totalWRVUs * conversionFactor + Number(basePay);
    const incentivePayment = totalCompensation - Number(basePay);

    setProjections({ totalWRVUs, totalCompensation, incentivePayment });
  };

  const compensationChart = {
    labels: [10, 15, 20, 25, 30].map(v => `${v} visits`),
    datasets: [{
      label: 'Total Compensation',
      data: [10, 15, 20, 25, 30].map(v => 
        v * inputs.avgWRVU * timePeriods[inputs.timePeriod] * inputs.conversionFactor + Number(inputs.basePay)
      ),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }]
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom align="center">wRVU Forecasting Tool</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Input Parameters</Typography>
            <TextField
              fullWidth margin="normal" type="number"
              label="Daily Patient Visits"
              name="dailyVisits"
              value={inputs.dailyVisits}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth margin="normal" type="number"
              label="Average wRVU per Encounter"
              name="avgWRVU"
              value={inputs.avgWRVU}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth margin="normal" type="number"
              label="Conversion Factor"
              name="conversionFactor"
              value={inputs.conversionFactor}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              fullWidth margin="normal" type="number"
              label="Base Pay"
              name="basePay"
              value={inputs.basePay}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Time Period</InputLabel>
              <Select
                name="timePeriod"
                value={inputs.timePeriod}
                onChange={handleInputChange}
              >
                {Object.keys(timePeriods).map((period) => (
                  <MenuItem key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Projections</Typography>
            {projections && (
              <Box>
                <Typography variant="body1">
                  Projected Total wRVUs: <strong>{projections.totalWRVUs.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body1">
                  Projected Total Compensation: <strong>${projections.totalCompensation.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body1">
                  Projected Incentive Payment: <strong>${projections.incentivePayment.toFixed(2)}</strong>
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Compensation vs. Patient Visits</Typography>
            <Line data={compensationChart} options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Total Compensation ($)' }
                },
                x: { title: { display: true, text: 'Daily Patient Visits' } }
              }
            }} />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default WRVUForecastingTool;