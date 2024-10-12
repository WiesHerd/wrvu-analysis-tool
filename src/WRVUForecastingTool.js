import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment, Switch, FormControlLabel, Slider, Divider, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { CalendarToday, AccessTime, People, TrendingUp, AttachMoney, School, Celebration, Assignment, Add, Remove, Delete, Event, InfoOutlined } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NumericFormat } from 'react-number-format';
import { Popover } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

function CustomNumberInput({ label, value, onChange, icon, min = 0, max = Infinity, step = 1, name, isCurrency = false, ...props }) {
  const handleIncrement = () => {
    onChange(name, Math.min(value + step, max));
  };

  const handleDecrement = () => {
    onChange(name, Math.max(value - step, min));
  };

  return (
    <NumericFormat
      customInput={TextField}
      fullWidth
      margin="normal"
      label={label}
      value={value}
      onValueChange={(values) => onChange(name, values.floatValue)}
      thousandSeparator={true}
      prefix={isCurrency ? '' : undefined}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {isCurrency ? <AttachMoney /> : icon}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleDecrement}>
              <Remove fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleIncrement}>
              <Add fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}

function WorkSchedule({ inputs, handleInputChange, handleShiftChange, handleDeleteShift }) {
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Work Schedule</Typography>
      <CustomNumberInput
        label="Vacation Weeks per Year"
        name="vacationWeeks"
        value={inputs.vacationWeeks}
        onChange={handleInputChange}
        icon={<Celebration />}
        min={0}
        max={52}
      />
      <CustomNumberInput
        label="Statutory Holidays per Year"
        name="statutoryHolidays"
        value={inputs.statutoryHolidays}
        onChange={handleInputChange}
        icon={<Event />}
        min={0}
        max={365}
      />
      <CustomNumberInput
        label="CME Days per Year"
        name="cmeDays"
        value={inputs.cmeDays}
        onChange={handleInputChange}
        icon={<School />}
        min={0}
        max={365}
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
          <IconButton onClick={() => handleDeleteShift(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<Add />} onClick={() => handleShiftChange(null, 'add')} sx={{ borderRadius: '12px' }}>
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
      borderRadius: '16px',
      p: 3, 
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
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
    <Paper elevation={3} sx={{ p: 4, mt: 5, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}> {/* Increased border radius */}
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
  const [anchorEl, setAnchorEl] = useState(null);

  const handleInputChange = (name, value) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
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

  const handleDeleteShift = (index) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      shifts: prevInputs.shifts.filter((_, i) => i !== index)
    }));
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}> {/* Increased border radius */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
            Compensation Forecast
          </Typography>
          <IconButton onClick={handleInfoClick} size="small" sx={{ ml: 1 }}>
            <InfoOutlined />
          </IconButton>
        </Box>
        <Typography 
          variant="h6" 
          align="center" 
          sx={{ 
            color: 'text.secondary', 
            mb: 4, 
            fontSize: '1.1rem', 
            fontWeight: 'normal' 
          }}
        >
          Schedule and Average wRVU Per Encounter Input
        </Typography>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleInfoClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Typography sx={{ p: 2, maxWidth: 300 }}>
            This screen allows you to input your work schedule details and average wRVU per encounter. 
            It calculates your estimated annual wRVUs, encounters, and potential compensation based on 
            your inputs. Adjust the values to see how changes affect your productivity and compensation forecasts.
          </Typography>
        </Popover>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <WorkSchedule 
              inputs={inputs} 
              handleInputChange={handleInputChange} 
              handleShiftChange={handleShiftChange} 
              handleDeleteShift={handleDeleteShift}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Patient Encounters</Typography>
              <FormControlLabel
                control={<Switch checked={isPerHour} onChange={handleSwitchChange} />}
                label={isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                sx={{ mb: 2 }}
              />
              <CustomNumberInput
                label={isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
                name={isPerHour ? "patientsPerHour" : "patientsPerDay"}
                value={isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay}
                onChange={handleInputChange}
                icon={<People />}
                min={0}
              />
              <CustomNumberInput
                label="Average wRVU Per Encounter"
                name="avgWRVUPerEncounter"
                value={inputs.avgWRVUPerEncounter}
                onChange={handleInputChange}
                icon={<TrendingUp />}
                step={0.1}
                min={0}
              />
              <CustomNumberInput
                label="Base Salary"
                name="baseSalary"
                value={inputs.baseSalary}
                onChange={handleInputChange}
                isCurrency={true}
                min={0}
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
                  sx: { 
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        <ProductivitySummary metrics={metrics} />

        {/* You can add your DetailedProjections component here if needed */}
      </Paper>
    </Container>
  );
}

export default WRVUForecastingTool;