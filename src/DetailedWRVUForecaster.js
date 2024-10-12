import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Slider, Box,
  CircularProgress, Alert, TextField, Grid, FormControlLabel,
  Switch, InputAdornment, IconButton, TableFooter, Container,
  Autocomplete, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Popover // Add this line
} from '@mui/material';
import { UploadFile, CalendarToday, AccessTime, People, TrendingUp, AttachMoney, Add, Delete, Celebration, Event, School, Refresh, Remove, InfoOutlined } from '@mui/icons-material';
import Papa from 'papaparse';
import { NumericFormat } from 'react-number-format';

const CPT_CATEGORIES = {
  OFFICE_VISITS: 'Office Visits',
  PREVENTIVE_CARE: 'Preventive Care'
};

function CustomNumberInput({ label, value, onChange, icon, min = 0, max = Infinity, step = 1, ...props }) {
  const handleIncrement = () => {
    onChange(Math.min(value + step, max));
  };

  const handleDecrement = () => {
    onChange(Math.max(value - step, min));
  };

  return (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      value={value === 0 ? '' : value}
      onChange={(e) => {
        const val = e.target.value === '' ? min : Number(e.target.value);
        onChange(isNaN(val) ? min : Math.max(min, Math.min(val, max)));
      }}
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            {icon}
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

function DetailedWRVUForecaster() {
  const [cptCodes, setCptCodes] = useState([]);
  const [utilizationPercentages, setUtilizationPercentages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [baseSalary, setBaseSalary] = useState(150000);
  const [wrvuConversionFactor, setWrvuConversionFactor] = useState(45.52);
  const [patientsPerDay, setPatientsPerDay] = useState(20);
  const [weeksWorkedPerYear, setWeeksWorkedPerYear] = useState(47);
  const [annualClinicDays, setAnnualClinicDays] = useState(235);
  const [vacationWeeks, setVacationWeeks] = useState(4);
  const [statutoryHolidays, setStatutoryHolidays] = useState(0);
  const [cmeDays, setCmeDays] = useState(5);
  const [shifts, setShifts] = useState([
    { name: 'Regular Clinic', hours: 8, perWeek: 4 },
    { name: 'Extended Hours', hours: 10, perWeek: 1 }
  ]);
  const [isPerHour, setIsPerHour] = useState(false);
  const [patientsPerHour, setPatientsPerHour] = useState(0);
  const [allCptCodes, setAllCptCodes] = useState([]); // Store all uploaded CPT codes
  const [customCptCodes, setCustomCptCodes] = useState([]); // Store custom added CPT codes
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    const savedData = localStorage.getItem('detailedWRVUData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setCptCodes(parsedData.cptCodes);
      setUtilizationPercentages(parsedData.utilizationPercentages);
      setBaseSalary(parsedData.baseSalary);
      setWrvuConversionFactor(parsedData.wrvuConversionFactor);
      setPatientsPerDay(parsedData.patientsPerDay);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('detailedWRVUData', JSON.stringify({
      cptCodes,
      utilizationPercentages,
      baseSalary,
      wrvuConversionFactor,
      patientsPerDay
    }));
  }, [cptCodes, utilizationPercentages, baseSalary, wrvuConversionFactor, patientsPerDay]);

  useEffect(() => {
    // Recalculate metrics when shifts change
    const newMetrics = calculateMetrics();
    // Update state or perform other actions with newMetrics
  }, [shifts, /* other dependencies */]);

  const handleFileUpload = (event) => {
    setIsLoading(true);
    setError(null);
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: (results) => {
        const parsedCodes = results.data
          .filter(row => row[0] && row[0].match(/^\d+$/)) // Filter for valid CPT codes
          .map(row => ({
            code: row[0],
            description: row[2],
            wRVU: parseFloat(row[5]) || 0,
            category: categorizeCode(row[0])
          }));
        setAllCptCodes(parsedCodes);
        const defaultCodes = parsedCodes.filter(code => 
          (code.code >= '99202' && code.code <= '99215') ||
          (code.code >= '99381' && code.code <= '99397')
        );
        setCptCodes(defaultCodes);
        initializeUtilizationPercentages(defaultCodes);
        setIsLoading(false);
      },
      error: (error) => {
        setError('Error parsing file: ' + error.message);
        setIsLoading(false);
      }
    });
  };

  const categorizeCode = (code) => {
    if (code >= '99202' && code <= '99215') return CPT_CATEGORIES.OFFICE_VISITS;
    if (code >= '99381' && code <= '99397') return CPT_CATEGORIES.PREVENTIVE_CARE;
    return null;
  };

  const initializeUtilizationPercentages = (codes) => {
    const initialPercentages = {};
    const equalPercentage = 100 / codes.length;
    codes.forEach(code => {
      initialPercentages[code.code] = equalPercentage;
    });
    setUtilizationPercentages(initialPercentages);
  };

  const handleSliderChange = (cptCode, newValue) => {
    setUtilizationPercentages(prev => {
      const allCodes = [...cptCodes, ...customCptCodes].map(cpt => cpt.code);
      const oldValue = prev[cptCode] || 0;
      const diff = newValue - oldValue;
      const otherCodes = allCodes.filter(code => code !== cptCode);
      
      const updated = { ...prev, [cptCode]: newValue };
      const totalOthers = otherCodes.reduce((sum, code) => sum + (prev[code] || 0), 0);
      const remainingPercentage = Math.max(0, 100 - newValue);

      if (totalOthers > 0) {
        const scaleFactor = remainingPercentage / totalOthers;
        otherCodes.forEach(code => {
          updated[code] = (prev[code] || 0) * scaleFactor;
        });
      }

      return updated;
    });
  };

  const calculateMetrics = () => {
    const weeksWorkedPerYear = 52 - vacationWeeks - (statutoryHolidays / 5) - (cmeDays / 5);
    const annualClinicDays = weeksWorkedPerYear * 5 - statutoryHolidays - cmeDays;
    
    // Calculate total weekly hours from shifts
    const weeklyHours = shifts.reduce((total, shift) => total + (shift.hours * shift.perWeek), 0);
    const annualClinicalHours = weeklyHours * weeksWorkedPerYear;

    let totalAnnualPatientEncounters = 0;
    if (isPerHour) {
      totalAnnualPatientEncounters = annualClinicalHours * patientsPerHour;
    } else {
      totalAnnualPatientEncounters = annualClinicDays * patientsPerDay;
    }

    const allCodes = [...cptCodes, ...customCptCodes];
    const totalWRVUs = allCodes.reduce((sum, cpt) => {
      const patientCount = ((utilizationPercentages[cpt.code] || 0) / 100) * totalAnnualPatientEncounters;
      return sum + (patientCount * cpt.wRVU);
    }, 0);

    // Calculate the actual patient encounters based on utilization percentages
    const actualAnnualPatientEncounters = allCodes.reduce((sum, cpt) => {
      return sum + Math.round(((utilizationPercentages[cpt.code] || 0) / 100) * totalAnnualPatientEncounters);
    }, 0);

    const encountersPerWeek = Math.round(actualAnnualPatientEncounters / weeksWorkedPerYear);

    const estimatedIncentivePayment = Math.max(0, (totalWRVUs * wrvuConversionFactor) - baseSalary);
    const estimatedTotalCompensation = baseSalary + estimatedIncentivePayment;

    return {
      estimatedIncentivePayment,
      estimatedTotalCompensation,
      weeksWorkedPerYear,
      encountersPerWeek,
      annualClinicDays,
      annualPatientEncounters: actualAnnualPatientEncounters,
      annualClinicalHours,
      estimatedAnnualWRVUs: totalWRVUs
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

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
      <Box sx={{ mr: 2, color: '#1976d2' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{value}</Typography>
      </Box>
    </Box>
  );

  const handleShiftChange = (index, field, value) => {
    setShifts(prev => {
      const newShifts = [...prev];
      if (field === 'add') {
        newShifts.push({ name: 'New Shift', hours: 0, perWeek: 0 });
      } else if (field === 'remove') {
        newShifts.splice(index, 1);
      } else {
        newShifts[index] = { 
          ...newShifts[index], 
          [field]: field === 'name' ? value : Number(value) || 0 
        };
      }
      return newShifts;
    });
  };

  const handleAddCustomCptCode = (newCode) => {
    setCustomCptCodes(prev => [...prev, newCode]);
    setUtilizationPercentages(prev => {
      const totalUtilization = Object.values(prev).reduce((sum, val) => sum + val, 0);
      const newUtilization = Math.max(0, (100 - totalUtilization) / 2); // Assign half of remaining utilization
      return {
        ...prev,
        [newCode.code]: newUtilization
      };
    });
  };

  const handleRemoveCustomCptCode = (codeToRemove) => {
    setCustomCptCodes(prev => prev.filter(code => code.code !== codeToRemove.code));
    setCptCodes(prev => prev.filter(code => code.code !== codeToRemove.code));
    setUtilizationPercentages(prev => {
      const { [codeToRemove.code]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleResetToDefault = () => {
    const defaultCodes = allCptCodes.filter(code => 
      (code.code >= '99202' && code.code <= '99215') ||
      (code.code >= '99381' && code.code <= '99397')
    );
    setCptCodes(defaultCodes);
    setCustomCptCodes([]);
    initializeUtilizationPercentages(defaultCodes);
  };

  const handleRemoveCptCode = (cptToRemove) => {
    if (!cptToRemove) return;
    
    if (customCptCodes.some(cpt => cpt.code === cptToRemove.code)) {
      setCustomCptCodes(prev => prev.filter(cpt => cpt.code !== cptToRemove.code));
    } else {
      setCptCodes(prev => prev.filter(cpt => cpt.code !== cptToRemove.code));
    }
    setUtilizationPercentages(prev => {
      const { [cptToRemove.code]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const handleInputChange = (name, value) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
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
          Detailed wRVU Analysis
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
           Before using this screen please upload your CMS Fee Schedule. 
            This screen allows you to perform a detailed analysis of your wRVU production by code.  
            You can input your work schedule, patient encounters, and customize your code utilization. 
            The tool calculates estimated annual wRVUs, patient encounters, and potential compensation 
            based on your inputs.
          </Typography>
        </Popover>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Work Schedule</Typography>
              <CustomNumberInput
                label="Vacation Weeks per Year"
                value={vacationWeeks}
                onChange={setVacationWeeks}
                icon={<Celebration />}
                min={0}
                max={52}
              />
              <CustomNumberInput
                label="Statutory Holidays per Year"
                value={statutoryHolidays}
                onChange={setStatutoryHolidays}
                icon={<Event />}
                min={0}
                max={365}
              />
              <CustomNumberInput
                label="CME Days per Year"
                value={cmeDays}
                onChange={setCmeDays}
                icon={<School />}
                min={0}
                max={365}
              />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Shift Types</Typography>
              {shifts.map((shift, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    sx={{ mr: 1, flexGrow: 1 }}
                    label="Shift Name"
                    value={shift.name || ''}
                    onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
                  />
                  <TextField
                    sx={{ mr: 1, width: '80px' }}
                    type="number"
                    label="Hours"
                    value={shift.hours || 0}
                    onChange={(e) => handleShiftChange(index, 'hours', e.target.value)}
                  />
                  <TextField
                    sx={{ mr: 1, width: '80px' }}
                    type="number"
                    label="Per Week"
                    value={shift.perWeek || 0}
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Patient Encounters</Typography>
              <FormControlLabel
                control={<Switch checked={isPerHour} onChange={() => setIsPerHour(!isPerHour)} />}
                label={isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                sx={{ mb: 2 }}
              />
              <CustomNumberInput
                label={isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
                value={isPerHour ? patientsPerHour : patientsPerDay}
                onChange={(value) => isPerHour ? setPatientsPerHour(value) : setPatientsPerDay(value)}
                icon={<People />}
                min={0}
              />
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="Base Salary"
                value={baseSalary}
                onValueChange={(values) => setBaseSalary(values.floatValue)}
                thousandSeparator={true}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="wRVU Conversion Factor"
                value={wrvuConversionFactor}
                onValueChange={(values) => setWrvuConversionFactor(values.floatValue)}
                decimalScale={2}
                fixedDecimalScale={true}
                suffix={' / wRVU'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFile />}
          sx={{ mb: 4 }}
        >
          Upload CMS Fee Schedule
          <input type="file" hidden onChange={handleFileUpload} accept=".csv" />
        </Button>

        {isLoading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {cptCodes.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 2, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="12%">Code</TableCell>
                  <TableCell width="8%" align="right">wRVU</TableCell>
                  <TableCell width="40%" align="center">Utilization %</TableCell>
                  <TableCell width="15%" align="right">Annual Estimated Patients</TableCell>
                  <TableCell width="15%" align="right">Patients per Week</TableCell>
                  <TableCell width="10%" align="center">Delete Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...cptCodes, ...customCptCodes].map((cpt) => {
                  const estimatedPatients = Math.round(((utilizationPercentages[cpt.code] || 0) / 100) * metrics.annualPatientEncounters);
                  const patientsPerWeek = Math.round(estimatedPatients / metrics.weeksWorkedPerYear);
                  return (
                    <TableRow key={cpt.code} sx={cpt.category ? {} : { backgroundColor: '#f5f5f5' }}>
                      <TableCell>{cpt.code}</TableCell>
                      <TableCell align="right">{cpt.wRVU.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Slider
                            value={utilizationPercentages[cpt.code] || 0}
                            onChange={(_, newValue) => handleSliderChange(cpt.code, newValue)}
                            aria-labelledby={`${cpt.code}-slider`}
                            valueLabelDisplay="auto"
                            step={0.1}
                            min={0}
                            max={100}
                            sx={{ mr: 2, flexGrow: 1 }}
                            valueLabelFormat={(value) => `${value.toFixed(1)}%`}
                          />
                          <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right' }}>
                            {(utilizationPercentages[cpt.code] || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{estimatedPatients.toLocaleString()}</TableCell>
                      <TableCell align="right">{patientsPerWeek.toLocaleString()}</TableCell>
                      <TableCell width="10%" align="center">
                        <IconButton 
                          onClick={() => setConfirmDelete(cpt)}
                          sx={{ 
                            padding: { xs: '12px', sm: '8px' },
                            '& svg': { fontSize: { xs: '1.5rem', sm: '1.25rem' } }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Search bar for adding custom CPT codes */}
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 2 }}>
                    <Autocomplete
                      options={allCptCodes.filter(code => 
                        !cptCodes.some(c => c.code === code.code) &&
                        !customCptCodes.some(c => c.code === code.code)
                      )}
                      getOptionLabel={(option) => `${option.code} - ${option.description}`}
                      renderInput={(params) => <TextField {...params} label="Search and add codes" />}
                      filterOptions={(options, { inputValue }) => {
                        const filterValue = inputValue.toLowerCase();
                        return options.filter(option => 
                          option.code.toLowerCase().includes(filterValue) ||
                          option.description.toLowerCase().includes(filterValue)
                        ).sort((a, b) => a.code.localeCompare(b.code));
                      }}
                      value={null}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleAddCustomCptCode(newValue);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} colSpan={4}>
                    Total:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {formatNumber(metrics.annualPatientEncounters)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {formatNumber(metrics.encountersPerWeek)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Refresh sx={{ fontSize: '16px' }} />}
            onClick={handleResetToDefault}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              fontSize: '0.75rem',
              padding: '6px 12px',
              height: '32px',
              minHeight: '32px',
              maxHeight: '32px',
              minWidth: 'auto',
              lineHeight: 1,
              textTransform: 'uppercase',
              fontWeight: 500,
              boxShadow: '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',
              borderRadius: '4px',
              '& .MuiButton-startIcon': {
                margin: 0,
                marginRight: '4px',
              },
              '& .MuiButton-startIcon > *:nth-of-type(1)': {
                fontSize: '16px',
              },
            }}
          >
            Reset Default Codes
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
          Productivity Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<AttachMoney fontSize="large" />}
              label="Estimated Incentive Payment"
              value={formatCurrency(metrics.estimatedIncentivePayment)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<AttachMoney fontSize="large" />}
              label="Estimated Total Compensation"
              value={formatCurrency(metrics.estimatedTotalCompensation)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<CalendarToday fontSize="large" />}
              label="Weeks Worked Per Year"
              value={formatNumber(metrics.weeksWorkedPerYear)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<People fontSize="large" />}
              label="Encounters per Week"
              value={formatNumber(metrics.encountersPerWeek)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<CalendarToday fontSize="large" />}
              label="Annual Clinic Days"
              value={formatNumber(metrics.annualClinicDays)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<People fontSize="large" />}
              label="Annual Patient Encounters"
              value={formatNumber(metrics.annualPatientEncounters)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<AccessTime fontSize="large" />}
              label="Annual Clinical Hours"
              value={formatNumber(metrics.annualClinicalHours)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatItem 
              icon={<TrendingUp fontSize="large" />}
              label="Estimated Annual wRVUs"
              value={formatNumber(metrics.estimatedAnnualWRVUs)}
            />
          </Grid>
        </Grid>

        <Dialog
          open={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the CPT code {confirmDelete?.code}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button onClick={() => {
              handleRemoveCptCode(confirmDelete);
              setConfirmDelete(null);
            }} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove or comment out the following Typography component */}
        {/* <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Provider Compensation Forecaster. All rights reserved.
        </Typography> */}
      </Paper>
    </Container>
  );
}

export default DetailedWRVUForecaster;