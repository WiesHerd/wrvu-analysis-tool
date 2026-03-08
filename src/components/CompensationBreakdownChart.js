import React from 'react';
import { Box, Typography } from '@mui/material';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

/**
 * Compensation breakdown: typography-led, Silicon Valley–style.
 * No chart chrome—clean rows, subtle proportion, lots of air.
 */
function CompensationBreakdownChart({ baseSalary = 0, incentivePayment = 0 }) {
  const baseVal = Math.max(0, baseSalary);
  const incentiveVal = Math.max(0, incentivePayment);
  const total = baseVal + incentiveVal;

  if (total <= 0) return null;

  const basePct = total > 0 ? (baseVal / total) * 100 : 100;
  const incentivePct = total > 0 ? (incentiveVal / total) * 100 : 0;

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {/* Row: Base salary */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.8125rem',
            letterSpacing: '0.01em',
          }}
        >
          Base salary
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            {formatCurrency(baseVal)}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            {basePct.toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      {/* Row: Incentive */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.8125rem',
            letterSpacing: '0.01em',
          }}
        >
          Incentive
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              color: incentiveVal > 0 ? 'success.main' : 'text.secondary',
            }}
          >
            {formatCurrency(incentiveVal)}
          </Typography>
          {incentivePct > 0 && (
            <Typography
              component="span"
              sx={{
                fontSize: '0.75rem',
                color: 'success.main',
                fontWeight: 500,
                opacity: 0.9,
              }}
            >
              {incentivePct.toFixed(1)}%
            </Typography>
          )}
        </Box>
      </Box>

      {/* Minimal proportion bar: thin, one track, no heavy blocks */}
      <Box
        sx={{
          mt: 1.5,
          height: 4,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          bgcolor: 'rgba(0,0,0,0.04)',
        }}
      >
        <Box
          sx={{
            width: `${basePct}%`,
            bgcolor: 'rgba(30, 41, 59, 0.2)',
            transition: 'width 0.3s ease',
          }}
        />
        <Box
          sx={{
            width: `${incentivePct}%`,
            bgcolor: incentivePct > 0 ? 'success.main' : 'transparent',
            opacity: incentivePct > 0 ? 0.85 : 0,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
}

export default CompensationBreakdownChart;
