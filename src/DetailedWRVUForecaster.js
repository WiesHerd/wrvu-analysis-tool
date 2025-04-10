import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Slider, Box,
  CircularProgress, Alert, TextField, Grid, FormControlLabel,
  Switch, InputAdornment, IconButton, TableFooter, Container,
  Autocomplete, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Popover, Accordion, AccordionSummary, AccordionDetails, Divider, AlertTitle
} from '@mui/material';
import { UploadFile, CalendarToday, AccessTime, People, TrendingUp, AttachMoney, Add, Delete, Celebration, Event, School, Refresh, Remove, InfoOutlined, Download, ExpandMore, Search } from '@mui/icons-material';
import Papa from 'papaparse';
import { NumericFormat } from 'react-number-format';

const PROCEDURE_CATEGORIES = {
  OFFICE_VISITS: 'Office Visits',
  PREVENTIVE_CARE: 'Preventive Care'
};

function CustomNumberInput({ label, value, onChange, icon, min = 0, max = Infinity, step = 0.01, ...props }) {
  const handleIncrement = () => {
    let newValue;
    if (step === 1) {
      newValue = Math.floor(value) + 1;
    } else {
      newValue = Number((value + step).toFixed(2));
    }
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    let newValue;
    if (step === 1) {
      newValue = Math.floor(value) - 1;
    } else {
      newValue = Number((value - step).toFixed(2));
    }
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value === '' ? min : Number(e.target.value);
    if (!isNaN(val)) {
      const newValue = step === 1 ? Math.floor(val) : Number(val.toFixed(2));
      onChange(Math.max(min, Math.min(newValue, max)));
    }
  };

  return (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            {icon}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Box sx={{ 
              display: 'flex', 
              gap: '2px',
              bgcolor: 'rgba(0,0,0,0.03)',
              borderRadius: '4px',
              padding: '2px',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)'
              }
            }}>
              <IconButton 
                size="small" 
                onClick={handleDecrement}
                sx={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                <Remove sx={{ fontSize: '0.9rem' }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleIncrement}
                sx={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                <Add sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>
            {props.InputProps?.endAdornment}
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
      {...props}
    />
  );
}

// Add a floating action button style
const fabStyle = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1000,
};

function DetailedWRVUForecaster({ totalVisits, onUpdateForecast }) {
  const [procedureCodes, setProcedureCodes] = useState([]);
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
  const [allProcedureCodes, setAllProcedureCodes] = useState([]); // Store all uploaded procedure codes
  const [customProcedureCodes, setCustomProcedureCodes] = useState([]); // Store custom added procedure codes
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputs, setInputs] = useState({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('detailedWRVUData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setProcedureCodes(parsedData.procedureCodes);
      setUtilizationPercentages(parsedData.utilizationPercentages);
      setBaseSalary(parsedData.baseSalary);
      setWrvuConversionFactor(parsedData.wrvuConversionFactor);
      setPatientsPerDay(parsedData.patientsPerDay);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('detailedWRVUData', JSON.stringify({
      procedureCodes,
      utilizationPercentages,
      baseSalary,
      wrvuConversionFactor,
      patientsPerDay
    }));
  }, [procedureCodes, utilizationPercentages, baseSalary, wrvuConversionFactor, patientsPerDay]);

  useEffect(() => {
    // Recalculate metrics when shifts change
    const newMetrics = calculateMetrics();
    
    // Call the callback from the parent component with the updated metrics
    if (onUpdateForecast) {
      onUpdateForecast({
        detailedForecast: procedureCodes,
        totalEstimatedWRVUs: newMetrics.estimatedAnnualWRVUs
      });
    }
  }, [shifts, procedureCodes, utilizationPercentages, baseSalary, wrvuConversionFactor, patientsPerDay, onUpdateForecast]);

  const handleFileUpload = (event) => {
    setIsLoading(true);
    setError(null);
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: (results) => {
        const parsedCodes = results.data
          .filter(row => row[0] && row[0].match(/^\d+$/)) // Filter for valid procedure codes
          .map(row => ({
            code: row[0],
            modifier: row[1],
            description: row[2],
            wRVU: parseFloat(row[3]) || 0,
            category: categorizeCode(row[0])
          }));
        setAllProcedureCodes(parsedCodes);
        const defaultCodes = parsedCodes.filter(code => 
          (code.code >= '99202' && code.code <= '99215') ||
          (code.code >= '99381' && code.code <= '99397')
        );
        setProcedureCodes(defaultCodes);
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
    if (code >= '99202' && code <= '99215') return PROCEDURE_CATEGORIES.OFFICE_VISITS;
    if (code >= '99381' && code <= '99397') return PROCEDURE_CATEGORIES.PREVENTIVE_CARE;
    return null;
  };

  const initializeUtilizationPercentages = (codes) => {
    const initialPercentages = {};
    
    // Define default percentages for common E/M codes - updated to reflect typical primary care patterns
    const defaultPercentages = {
      // Established patient visits (typically ~85% of visits)
      '99213': 35, // Level 3 - most common
      '99214': 40, // Level 4 - also very common in current practice
      '99215': 10, // Level 5 - complex patients
      
      // New patient visits (typically ~15% of visits)
      '99203': 8,  // Level 3 new
      '99204': 5,  // Level 4 new
      '99205': 2,  // Level 5 new - complex new patients

      // Preventive visits (distributed within the above percentages)
      '99395': 0,  // Will be adjusted if added
      '99396': 0,
      '99397': 0,
      '99384': 0
    };

    // First pass: set known percentages
    codes.forEach(code => {
      if (defaultPercentages.hasOwnProperty(code.code)) {
        initialPercentages[code.code] = defaultPercentages[code.code];
      } else {
        // For any other codes, start with a small percentage
        initialPercentages[code.code] = 0;
      }
    });

    // Calculate total assigned percentage
    const totalAssigned = Object.values(initialPercentages).reduce((sum, val) => sum + val, 0);

    // If total is not 100%, adjust proportionally
    if (totalAssigned !== 100 && codes.length > 0) {
      const scaleFactor = 100 / totalAssigned;
      Object.keys(initialPercentages).forEach(code => {
        initialPercentages[code] *= scaleFactor;
      });
    }

    setUtilizationPercentages(initialPercentages);
  };

  const handleSliderChange = (procedureCode, newValue) => {
    setUtilizationPercentages(prev => {
      const allCodes = [...procedureCodes, ...customProcedureCodes].map(cpt => cpt.code);
      const oldValue = prev[procedureCode] || 0;
      const diff = newValue - oldValue;
      const otherCodes = allCodes.filter(code => code !== procedureCode);
      
      const updated = { ...prev, [procedureCode]: newValue };
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
    // Calculate work weeks
    const effectiveWeeksWorkedPerYear = 52 - (vacationWeeks || 0) - ((statutoryHolidays || 0) / 5) - ((cmeDays || 0) / 5);
    const effectiveAnnualClinicDays = effectiveWeeksWorkedPerYear * 5 - (statutoryHolidays || 0) - (cmeDays || 0);
    
    // Calculate total weekly hours from shifts
    const weeklyHours = (shifts || []).reduce((total, shift) => total + ((shift?.hours || 0) * (shift?.perWeek || 0)), 0);
    const weeklyDays = (shifts || []).reduce((total, shift) => total + (shift?.perWeek || 0), 0);
    const annualClinicalHours = weeklyHours * effectiveWeeksWorkedPerYear;

    let totalAnnualPatientEncounters = 0;
    let patientsPerWeek = 0;
    
    // Use totalVisits from props if available, otherwise calculate based on inputs
    if (totalVisits && totalVisits > 0) {
      totalAnnualPatientEncounters = totalVisits;
      // Derive patientsPerWeek from totalVisits and weeks worked per year
      patientsPerWeek = totalVisits / effectiveWeeksWorkedPerYear;
    } else if (isPerHour) {
      patientsPerWeek = weeklyHours * (patientsPerHour || 0);
      totalAnnualPatientEncounters = annualClinicalHours * (patientsPerHour || 0);
    } else {
      patientsPerWeek = weeklyDays * (patientsPerDay || 0);
      totalAnnualPatientEncounters = effectiveAnnualClinicDays * (patientsPerDay || 0);
    }

    // Ensure procedureCodes and customProcedureCodes are arrays before using them
    const procs = Array.isArray(procedureCodes) ? procedureCodes : [];
    const custom = Array.isArray(customProcedureCodes) ? customProcedureCodes : [];
    const allCodes = [...procs, ...custom].filter(Boolean); // Filter out any undefined/null entries

    const totalWRVUs = allCodes.reduce((sum, code) => {
      if (!code || !code.code) return sum;
      const patientCount = ((utilizationPercentages[code.code] || 0) / 100) * totalAnnualPatientEncounters;
      return sum + (patientCount * (code.wRVU || 0));
    }, 0);

    // Calculate the actual patient encounters based on utilization percentages
    const actualAnnualPatientEncounters = allCodes.reduce((sum, code) => {
      if (!code || !code.code) return sum;
      return sum + Math.round(((utilizationPercentages[code.code] || 0) / 100) * totalAnnualPatientEncounters);
    }, 0);

    const estimatedIncentivePayment = Math.max(0, (totalWRVUs * (wrvuConversionFactor || 0)) - (baseSalary || 0));
    const estimatedTotalCompensation = (baseSalary || 0) + estimatedIncentivePayment;

    return {
      estimatedIncentivePayment,
      estimatedTotalCompensation,
      weeksWorkedPerYear: effectiveWeeksWorkedPerYear,
      patientsPerWeek,
      annualClinicDays: effectiveAnnualClinicDays,
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

  const handleAddCustomProcedureCode = (newCode) => {
    setCustomProcedureCodes(prev => [...prev, newCode]);
    setUtilizationPercentages(prev => {
      const totalUtilization = Object.values(prev).reduce((sum, val) => sum + val, 0);
      const newUtilization = Math.max(0, (100 - totalUtilization) / 2); // Assign half of remaining utilization
      return {
        ...prev,
        [newCode.code]: newUtilization
      };
    });
  };

  const handleRemoveCustomProcedureCode = (codeToRemove) => {
    setCustomProcedureCodes(prev => prev.filter(code => code.code !== codeToRemove.code));
    setProcedureCodes(prev => prev.filter(cpt => cpt.code !== codeToRemove.code));
    setUtilizationPercentages(prev => {
      const { [codeToRemove.code]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleResetToDefault = () => {
    if (allProcedureCodes.length === 0) {
      // Create default E/M codes if no file uploaded
      const defaultEMCodes = [
        { code: '99202', description: 'Office/outpatient visit new 15-29 min', wRVU: 0.93, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99203', description: 'Office/outpatient visit new 30-44 min', wRVU: 1.60, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99204', description: 'Office/outpatient visit new 45-59 min', wRVU: 2.60, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99205', description: 'Office/outpatient visit new 60-74 min', wRVU: 3.50, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99211', description: 'Office/outpatient visit est minimal', wRVU: 0.18, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99212', description: 'Office/outpatient visit est 10-19 min', wRVU: 0.70, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99213', description: 'Office/outpatient visit est 20-29 min', wRVU: 1.30, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99214', description: 'Office/outpatient visit est 30-39 min', wRVU: 1.92, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS },
        { code: '99215', description: 'Office/outpatient visit est 40-54 min', wRVU: 2.80, modifier: '', category: PROCEDURE_CATEGORIES.OFFICE_VISITS }
      ];
      
      setAllProcedureCodes(prev => [...prev, ...defaultEMCodes]);
      setProcedureCodes(defaultEMCodes);
      setCustomProcedureCodes([]);
      initializeUtilizationPercentages(defaultEMCodes);
      return;
    }
    
    const defaultCodes = allProcedureCodes.filter(code => 
      (code.code >= '99202' && code.code <= '99215') ||
      (code.code >= '99381' && code.code <= '99397')
    );
    
    if (defaultCodes.length === 0) {
      // If no default codes are found in the uploaded file
      setError("No standard E/M codes (99202-99215, 99381-99397) found in your uploaded file.");
      setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds
      return;
    }
    
    setProcedureCodes(defaultCodes);
    setCustomProcedureCodes([]);
    initializeUtilizationPercentages(defaultCodes);
  };

  const handleClearAllCodes = () => {
    // Set confirmation dialog to open
    setConfirmClearAll(true);
  };

  const executeClearAll = () => {
    // Clear all procedure codes, both uploaded and custom
    setProcedureCodes([]);
    setCustomProcedureCodes([]);
    setUtilizationPercentages({});
    setConfirmClearAll(false);
  };

  const handleRemoveProcedureCode = (codeToRemove) => {
    if (!codeToRemove) return;
    
    if (customProcedureCodes.some(code => code.code === codeToRemove.code)) {
      setCustomProcedureCodes(prev => prev.filter(code => code.code !== codeToRemove.code));
    } else {
      setProcedureCodes(prev => prev.filter(code => code.code !== codeToRemove.code));
    }
    setUtilizationPercentages(prev => {
      const { [codeToRemove.code]: _, ...rest } = prev;
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

  // Filter function for the table
  const safeFilteredProcedureCodes = () => {
    const procs = Array.isArray(procedureCodes) ? procedureCodes : [];
    const custom = Array.isArray(customProcedureCodes) ? customProcedureCodes : [];
    
    return [...procs, ...custom].filter(code => {
      if (!code) return false;
      const search = (searchTerm || '').toLowerCase().trim();
      return search === '' || 
             (code.code && code.code.toLowerCase().includes(search)) || 
             (code.description && code.description.toLowerCase().includes(search));
    });
  };

  const filteredProcedureCodes = safeFilteredProcedureCodes();

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = `${process.env.PUBLIC_URL}/template.csv`;
    link.download = 'template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'normal',
                fontSize: '1.1rem'
              }}
            >
              Detailed wRVU Analysis Based on Procedure Code Distribution
            </Typography>
            <IconButton onClick={handleInfoClick} size="small" sx={{ ml: 1 }}>
              <InfoOutlined />
            </IconButton>
          </Box>
        </Box>
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

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Accordion 
              defaultExpanded={false}
              sx={{ 
                mb: 4,
                borderRadius: '16px !important',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                boxShadow: 'none',
                '&.MuiAccordion-root': {
                  borderRadius: '16px',
                  '&:before': {
                    display: 'none',
                  },
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: '#f5f8fa',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  CMS Fee Schedule Upload Instructions
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  To use this tool, you'll need to upload a CSV file containing your CMS Fee Schedule data. The file should include the following columns in this order:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Column</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Example</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Procedure Code</TableCell>
                        <TableCell>The 5-digit procedure code</TableCell>
                        <TableCell>99213</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Modifier</TableCell>
                        <TableCell>Procedure modifier (if applicable)</TableCell>
                        <TableCell>26</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Service description</TableCell>
                        <TableCell>Office Visit, Established Patient, Level 3</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Work RVUs</TableCell>
                        <TableCell>Work RVU value</TableCell>
                        <TableCell>1.50</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You can download the CMS Physician Fee Schedule from the CMS website and format it according to the template above. Only procedure code, modifier, description, and wRVU values are needed. The tool will automatically identify and load the most commonly used E/M codes for primary care.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handleDownloadTemplate}
                    startIcon={<Download />}
                    size="medium"
                    sx={{ 
                      height: '40px',
                      borderColor: '#0288d1',
                      color: '#0288d1',
                      '&:hover': {
                        backgroundColor: 'rgba(2, 136, 209, 0.04)',
                        borderColor: '#01579b'
                      }
                    }}
                  >
                    Download Template
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 4, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Work Schedule</Typography>
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="Vacation Weeks per Year"
                value={vacationWeeks}
                onValueChange={(values) => setVacationWeeks(values.floatValue || 0)}
                decimalScale={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Celebration />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ 
                        display: 'flex', 
                        gap: '2px',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderRadius: '4px',
                        padding: '2px',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        }
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => setVacationWeeks(Math.max(0, vacationWeeks - 1))}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Remove sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => setVacationWeeks(vacationWeeks + 1)}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Add sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="Statutory Holidays per Year"
                value={statutoryHolidays}
                onValueChange={(values) => setStatutoryHolidays(values.floatValue || 0)}
                decimalScale={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Event />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ 
                        display: 'flex', 
                        gap: '2px',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderRadius: '4px',
                        padding: '2px',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        }
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => setStatutoryHolidays(Math.max(0, statutoryHolidays - 1))}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Remove sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => setStatutoryHolidays(statutoryHolidays + 1)}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Add sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="CME Days per Year"
                value={cmeDays}
                onValueChange={(values) => setCmeDays(values.floatValue || 0)}
                decimalScale={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ 
                        display: 'flex', 
                        gap: '2px',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderRadius: '4px',
                        padding: '2px',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        }
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => setCmeDays(Math.max(0, cmeDays - 1))}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Remove sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => setCmeDays(cmeDays + 1)}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Add sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
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
            <Paper elevation={3} sx={{ p: 3, mb: 4, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Patient Encounters</Typography>
              <FormControlLabel
                control={<Switch checked={isPerHour} onChange={() => setIsPerHour(!isPerHour)} />}
                label={isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                sx={{ mb: 2 }}
              />
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label={isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
                value={isPerHour ? patientsPerHour : patientsPerDay}
                onValueChange={(values) => {
                  const value = values.floatValue || 0;
                  if (isPerHour) {
                    setPatientsPerHour(value);
                  } else {
                    setPatientsPerDay(value);
                  }
                }}
                decimalScale={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ 
                        display: 'flex', 
                        gap: '2px',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderRadius: '4px',
                        padding: '2px',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        }
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            if (isPerHour) {
                              setPatientsPerHour(Math.max(0, patientsPerHour - 1));
                            } else {
                              setPatientsPerDay(Math.max(0, patientsPerDay - 1));
                            }
                          }}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Remove sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            if (isPerHour) {
                              setPatientsPerHour(patientsPerHour + 1);
                            } else {
                              setPatientsPerDay(patientsPerDay + 1);
                            }
                          }}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Add sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
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
              <CustomNumberInput
                label="wRVU Conversion Factor"
                value={wrvuConversionFactor}
                onChange={setWrvuConversionFactor}
                icon={<AttachMoney />}
                step={0.01}
                min={0}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Target Annual wRVUs"
                value={wrvuConversionFactor ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(baseSalary / wrvuConversionFactor) : '0'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUp />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                helperText="Target wRVUs needed to reach base salary (Base Salary ÷ Conversion Factor)"
              />
            </Paper>
          </Grid>
        </Grid>

        {isLoading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Management buttons moved to top - only show when data exists */}
        {procedureCodes.length > 0 && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleResetToDefault}
                  size="medium"
                  color="primary"
                  fullWidth
                  sx={{ 
                    height: '40px',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      borderColor: '#1565c0'
                    }
                  }}
                >
                  Reset Default Codes
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFile />}
                  size="medium"
                  fullWidth
                  sx={{ 
                    height: '40px',
                    borderColor: '#2e7d32',
                    color: '#2e7d32',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      borderColor: '#1b5e20'
                    }
                  }}
                >
                  Upload Fee Schedule
                  <input type="file" hidden onChange={handleFileUpload} accept=".csv" />
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={handleClearAllCodes}
                  size="medium"
                  color="error"
                  fullWidth
                  sx={{ 
                    height: '40px',
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      borderColor: '#c62828'
                    }
                  }}
                >
                  Clear All Codes
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {procedureCodes.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search codes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by procedure code or description..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(25,118,210,0.02)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(25,118,210,0.05)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      boxShadow: '0 0 0 2px rgba(25,118,210,0.2)',
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
                sx={{
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  px: 3,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                Add Code
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #e0e0e0' }}>
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
                  {filteredProcedureCodes.map((cpt) => {
                    const estimatedPatients = Math.round(((utilizationPercentages[cpt.code] || 0) / 100) * metrics.annualPatientEncounters);
                    const patientsPerWeek = Math.round(((utilizationPercentages[cpt.code] || 0) / 100) * metrics.patientsPerWeek);
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
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {/* Empty cell for wRVU column */}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right' }}>
                          100%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {formatNumber(metrics.annualPatientEncounters)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {formatNumber(metrics.patientsPerWeek)}
                    </TableCell>
                    <TableCell align="center">
                      {/* Empty cell for alignment with delete button column */}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 6, mb: 4, border: '1px solid #e0e0e0', borderRadius: '16px', background: 'linear-gradient(to bottom, #f9f9f9, #ffffff)' }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
              No Procedure Codes Loaded
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              To analyze procedure codes and calculate wRVUs, you need to add codes first:
            </Typography>
            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 850, margin: '0 auto' }}>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleResetToDefault}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: '10px',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  Load Default E/M Codes
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Instantly load standard E/M codes with default values
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button 
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFile />}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: '10px',
                    borderWidth: '2px',
                    borderColor: '#2e7d32',
                    color: '#2e7d32',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      borderColor: '#1b5e20',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  Upload Fee Schedule
                  <input type="file" hidden onChange={handleFileUpload} accept=".csv" />
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Upload a CSV file with your organization's codes
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setAddDialogOpen(true)}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: '10px',
                    borderWidth: '2px',
                    borderColor: '#0288d1',
                    color: '#0288d1',
                    '&:hover': {
                      backgroundColor: 'rgba(2, 136, 209, 0.04)',
                      borderColor: '#01579b',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  Add Codes Manually
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Create custom procedure codes individually
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
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
              value={formatNumber(metrics.patientsPerWeek)}
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
              Are you sure you want to delete the procedure code {confirmDelete?.code}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button onClick={() => {
              handleRemoveProcedureCode(confirmDelete);
              setConfirmDelete(null);
            }} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmClearAll}
          onClose={() => setConfirmClearAll(false)}
        >
          <DialogTitle>Clear All Codes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove all procedure codes? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmClearAll(false)}>Cancel</Button>
            <Button onClick={executeClearAll} color="error">
              Clear All
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for easy code adding */}
        <Button
          variant="contained"
          color="primary"
          aria-label="add"
          onClick={() => setAddDialogOpen(true)}
          sx={{
            ...fabStyle,
            borderRadius: '50%',
            width: 56,
            height: 56,
            minWidth: 56,
            boxShadow: '0 8px 16px rgba(25,118,210,0.3)',
            '&:hover': {
              boxShadow: '0 12px 20px rgba(25,118,210,0.4)',
            },
          }}
        >
          <Add sx={{ fontSize: '1.5rem' }}/>
        </Button>

        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Procedure Code</DialogTitle>
          <DialogContent>
            <Box component="form" id="add-code-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newCode = {
                code: formData.get('code'),
                description: formData.get('description'),
                wRVU: parseFloat(formData.get('wRVU')) || 0,
                modifier: formData.get('modifier') || '',
                category: null
              };
              if (newCode.code && !isNaN(newCode.wRVU)) {
                handleAddCustomProcedureCode(newCode);
                setAddDialogOpen(false);
              }
            }} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    name="code"
                    label="CPT Code *"
                    variant="outlined"
                    required
                    fullWidth
                    placeholder="e.g. 99213"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="modifier"
                    label="Modifier (optional)"
                    variant="outlined"
                    fullWidth
                    placeholder="e.g. 26"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description *"
                    variant="outlined"
                    required
                    fullWidth
                    placeholder="e.g. Office visit, established patient"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="wRVU"
                    label="wRVU Value *"
                    variant="outlined"
                    required
                    type="number"
                    inputProps={{ step: "0.01", min: "0" }}
                    fullWidth
                    placeholder="e.g. 1.30"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button 
              form="add-code-form" 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              Add Code
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