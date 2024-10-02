import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment, Switch, FormControlLabel, Slider, Divider, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { CalendarToday, AccessTime, People, TrendingUp, AttachMoney, School, Celebration, Assignment, Add, Remove, Delete, Event } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

function WorkSchedule({ inputs, handleInputChange, handleShiftChange }) {
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Work Schedule</Typography>
      <TextField
        fullWidth
        margin="normal"
        type="number"
        label="Vacation Weeks per Year"
        name="vacationWeeks"
        value={inputs.vacationWeeks}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Celebration />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        margin="normal"
        type="number"
        label="Statutory Holidays per Year"
        name="statutoryHolidays"
        value={inputs.statutoryHolidays}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Event />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        margin="normal"
        type="number"
        label="CME Days per Year"
        name="cmeDays"
        value={inputs.cmeDays}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <School />
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Shift Types</Typography>
      {inputs.shifts.map((shift, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            sx={{ mr: 1, flexGrow: 1 }}
            label="Shift Name"
            value={shift.name}
            onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
          />
          <TextField
            sx={{ mr: 1, width: '80px' }}
            type="number"
            label="Hours"
            value={shift.hours}
            onChange={(e) => handleShiftChange(index, 'hours', e.target.value)}
          />
          <TextField
            sx={{ mr: 1, width: '80px' }}
            type="number"
            label="Per Week"
            value={shift.perWeek}
            onChange={(e) => handleShiftChange(index, 'perWeek', e.target.value)}
          />
          <IconButton onClick={() => handleShiftChange(index, 'remove')}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<Add />} onClick={() => handleShiftChange(null, 'add')}>
        Add Shift Type
      </Button>
    </Paper>
  );
}

function ProductivitySummary({ metrics }) {
  const formatNumber = (value) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const StatItem = ({ icon, label, value }) => (
    <Box sx={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px', 
      p: 3, 
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      transition: 'box-shadow 0.3s',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }
    }}>
      <Box sx={{ mr: 3, color: '#1976d2' }}>{icon}</Box>
      <Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 5, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
        Productivity Summary
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {metrics.incentivePayment > 0 && (
            <StatItem 
              icon={<AttachMoney fontSize="large" />}
              label="Estimated Incentive Payment"
              value={formatCurrency(metrics.incentivePayment)}
            />
          )}
          <StatItem 
            icon={<CalendarToday fontSize="large" />}
            label="Weeks Worked Per Year"
            value={formatNumber(metrics.weeksWorkedPerYear)}
          />
          <StatItem 
            icon={<CalendarToday fontSize="large" />}
            label="Annual Clinic Days"
            value={formatNumber(metrics.clinicDaysPerYear)}
          />
          <StatItem 
            icon={<AccessTime fontSize="large" />}
            label="Annual Clinical Hours"
            value={formatNumber(metrics.annualHours)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatItem 
            icon={<AttachMoney fontSize="large" />}
            label="Estimated Total Compensation"
            value={formatCurrency(metrics.totalCompensation)}
          />
          <StatItem 
            icon={<People fontSize="large" />}
            label="Encounters per Week"
            value={formatNumber(metrics.encountersPerWeek)}
          />
          <StatItem 
            icon={<People fontSize="large" />}
            label="Annual Patient Encounters"
            value={formatNumber(metrics.annualEncounters)}
          />
          <StatItem 
            icon={<TrendingUp fontSize="large" />}
            label="Estimated Annual wRVUs"
            value={formatNumber(metrics.annualWRVUs)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

function WRVUForecastingTool({ setTotalVisits }) {
  const [inputs, setInputs] = useState({
    weeksPerYear: 48, // Make sure this is set
    vacationWeeks: 4,
    cmeDays: 5,
    statutoryHolidays: 0,
    shifts: [
      { name: 'Regular Clinic', hours: 8, perWeek: 4 },
      { name: 'Extended Hours', hours: 10, perWeek: 1 },
    ],
    patientsPerHour: 2,
    patientsPerDay: 16,
    avgWRVUPerEncounter: 1.5,
    baseSalary: 150000,
    wrvuConversionFactor: 45.52,
  });

  const [metrics, setMetrics] = useState({
    clinicDaysPerYear: 0,
    annualHours: 0,
    annualEncounters: 0,
    annualWRVUs: 0,
    wRVUCompensation: 0,
    totalCompensation: 0
  });

  const [isPerHour, setIsPerHour] = useState(true);
  const [detailedForecast, setDetailedForecast] = useState([]);
  const [totalEstimatedWRVUs, setTotalEstimatedWRVUs] = useState(0);
  const [totalVisits, setTotalVisitsLocal] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleShiftChange = (index, field, value) => {
    setInputs(prev => {
      const newShifts = [...prev.shifts];
      newShifts[index] = { ...newShifts[index], [field]: parseFloat(value) || 0 };
      return { ...prev, shifts: newShifts };
    });
  };

  const handleSwitchChange = () => {
    setIsPerHour(!isPerHour);
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatCompactCurrency = (value) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact', 
      compactDisplay: 'short', 
      maximumFractionDigits: 1 
    }).format(value);

  useEffect(() => {
    const totalHoursPerWeek = inputs.shifts.reduce((total, shift) => 
      total + (shift.hours * shift.perWeek), 0);
    
    const totalDaysPerWeek = inputs.shifts.reduce((total, shift) => 
      total + shift.perWeek, 0);

    const totalDaysOff = (inputs.vacationWeeks * 7) + inputs.cmeDays + inputs.statutoryHolidays;
    const weeksWorkedPerYear = 52 - (totalDaysOff / 7);
    const annualHours = totalHoursPerWeek * weeksWorkedPerYear;
    const annualDays = totalDaysPerWeek * weeksWorkedPerYear;
    
    const annualEncounters = isPerHour 
      ? annualHours * inputs.patientsPerHour
      : inputs.patientsPerDay * annualDays;
    
    const encountersPerWeek = annualEncounters / weeksWorkedPerYear;
    const annualWRVUs = annualEncounters * inputs.avgWRVUPerEncounter;
    
    // Calculate the total wRVU compensation
    const totalWRVUCompensation = annualWRVUs * inputs.wrvuConversionFactor;
    
    // Calculate the incentive payment (only the amount above base salary)
    const incentivePayment = Math.max(0, totalWRVUCompensation - inputs.baseSalary);
    
    // Total compensation is base salary plus incentive payment
    const totalCompensation = inputs.baseSalary + incentivePayment;

    setMetrics({
      weeksWorkedPerYear,
      clinicDaysPerYear: annualDays,
      annualHours,
      encountersPerWeek,
      annualEncounters,
      annualWRVUs,
      incentivePayment,
      totalCompensation
    });

    setTotalVisitsLocal(annualEncounters);
    setTotalVisits(annualEncounters);
  }, [inputs, isPerHour, setTotalVisits]);

  const handleUpdateForecast = (newForecast) => {
    setDetailedForecast(newForecast.detailedForecast);
    setTotalEstimatedWRVUs(newForecast.totalEstimatedWRVUs);
    
    setInputs(prev => ({
      ...prev,
      avgWRVUPerEncounter: newForecast.totalEstimatedWRVUs / totalVisits
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        Quick wRVU Estimator
      </Typography>
      <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.secondary', mb: 4 }}>
        Productivity Analysis
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <WorkSchedule inputs={inputs} handleInputChange={handleInputChange} handleShiftChange={handleShiftChange} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Patient Encounters</Typography>
            <FormControlLabel
              control={<Switch checked={isPerHour} onChange={handleSwitchChange} />}
              label={isPerHour ? "Patients Per Hour" : "Patients Per Day"}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label={isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
              name={isPerHour ? "patientsPerHour" : "patientsPerDay"}
              value={isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <People />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Average wRVU Per Encounter"
              name="avgWRVUPerEncounter"
              value={inputs.avgWRVUPerEncounter}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingUp />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Base Salary"
              name="baseSalary"
              value={inputs.baseSalary}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="wRVU Conversion Factor"
              name="wrvuConversionFactor"
              value={inputs.wrvuConversionFactor}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">/ wRVU</InputAdornment>,
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <ProductivitySummary metrics={metrics} />

      {/* You can add your DetailedProjections component here if needed */}
    </Container>
  );
}

export default WRVUForecastingTool;