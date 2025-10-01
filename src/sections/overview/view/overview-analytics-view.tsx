import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import axios from 'src/utils/axios';

// Removed unused mock data imports
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

interface Log {
  id: number;
  url: string;
  type: string;
  isSafe: boolean;
  timestamp: string | null; // allow null
}

export function OverviewAnalyticsView() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('token');

    if (!isAuthenticated || !token) {
      router.push('/sign-in');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/admin/logs');
      console.log('Fetched logs:', response.data);

      const data = (Array.isArray(response.data) ? response.data : [])
        .filter((log) => typeof log.timestamp === 'string' && log.timestamp.trim() !== ''); // clean bad data

      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        router.push('/sign-in');
      } else {
        alert('Failed to fetch logs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Helper: get months safely
  const getMonths = (logEntries: Log[]) => {
    const entries = Array.isArray(logEntries) ? logEntries : [];
    const months = [
      ...new Set(
        entries
          .filter((log) => typeof log.timestamp === 'string') // ensure valid
          .map((log) => log.timestamp!.slice(0, 7))
      ),
    ];
    return months.sort();
  };

  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const totalLogsData = () => {
    const months = getMonths(logs);
    const series = months.map((month) =>
      logs.filter((log) => log.timestamp?.startsWith(month)).length
    );

    const currentMonthCount = series[series.length - 1] || 0;
    const previousMonthCount = series[series.length - 2] || 0;
    const percent = calculatePercentChange(currentMonthCount, previousMonthCount);

    return {
      total: logs.length,
      percent,
      chart: {
        categories: months,
        series,
      },
    };
  };

  // Removed safeLogsData - not used in simplified dashboard

  const unsafeLogsData = () => {
    const unsafeLogs = logs.filter((log) => !log.isSafe);
    const months = getMonths(unsafeLogs);
    const series = months.map((month) =>
      unsafeLogs.filter((log) => log.timestamp?.startsWith(month)).length
    );

    const currentMonthCount = series[series.length - 1] || 0;
    const previousMonthCount = series[series.length - 2] || 0;
    const percent = calculatePercentChange(currentMonthCount, previousMonthCount);

    return {
      total: unsafeLogs.length,
      percent,
      chart: {
        categories: months,
        series,
      },
    };
  };

  // Removed phishingLogsData - not used in simplified dashboard

  // Removed ransomwareLogsData - not used in simplified dashboard

  // Removed dosLogsData - not used in simplified dashboard

  const threatDetectionRate = () => {
    const totalLogs = logs.length;
    const unsafeLogs = logs.filter((log) => !log.isSafe).length;
    const detectionRate = totalLogs > 0 ? (unsafeLogs / totalLogs) * 100 : 0;
    
    return {
      rate: Math.round(detectionRate * 100) / 100,
      total: totalLogs,
      detected: unsafeLogs,
    };
  };

  const securityScore = () => {
    const totalLogs = logs.length;
    const safeLogs = logs.filter((log) => log.isSafe).length;
    const score = totalLogs > 0 ? (safeLogs / totalLogs) * 100 : 100;
    
    return {
      score: Math.round(score * 100) / 100,
      total: totalLogs,
      safe: safeLogs,
    };
  };

  const conversionRatesData = () => {
    const types = [...new Set(logs.map((log) => log.type))];
    const safeCounts = types.map((type) =>
      logs.filter((log) => log.type === type && log.isSafe).length
    );
    const unsafeCounts = types.map((type) =>
      logs.filter((log) => log.type === type && !log.isSafe).length
    );

    return {
      categories: types,
      series: [
        { name: 'Safe Logs', data: safeCounts },
        { name: 'Threats Detected', data: unsafeCounts },
      ],
    };
  };

  const currentSubjectData = () => {
    const types = [...new Set(logs.map((log) => log.type))];
    const safeCounts = types.map((type) =>
      logs.filter((log) => log.type === type && log.isSafe).length
    );

    return {
      categories: types,
      series: types.map((type, index) => ({
        name: type,
        data: [safeCounts[index]],
      })),
    };
  };

  const currentVisitsData = () => {
    const safeCount = logs.filter((log) => log.isSafe).length;
    const unsafeCount = logs.filter((log) => !log.isSafe).length;

    return {
      series: [
        { label: 'Safe', value: safeCount },
        { label: 'Unsafe', value: unsafeCount },
      ],
    };
  };

  const websiteVisitsData = () => {
    const dates = [...new Set(logs
      .filter((log) => typeof log.timestamp === 'string')
      .map((log) => log.timestamp!.split(' ')[0]))];

    // Get all unique threat types
    const threatTypes = [...new Set(logs.map((log) => log.type))];
    
    const series = threatTypes.map((type) => ({
      name: type,
      data: dates.map((date) =>
        logs.filter((log) => log.timestamp?.startsWith(date) && log.type === type).length
      ),
    }));

    return {
      categories: dates,
      series,
    };
  };

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hi, Welcome back 👋
        </Typography>
        <Typography>Loading...</Typography>
      </DashboardContent>
    );
  }

  if (logs.length === 0) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hi, Attijari Bank Admin 👋
        </Typography>
        <Typography>No logs available to display charts.</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Attijari Bank Admin 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Most Important Security Metrics */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Threats"
            percent={totalLogsData().percent}
            total={totalLogsData().total}
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/document.svg" />}
            chart={totalLogsData().chart}
          />
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Active Threats"
            percent={unsafeLogsData().percent}
            total={unsafeLogsData().total}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/close.svg" />}
            chart={unsafeLogsData().chart}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Security Score"
            percent={securityScore().score}
            total={securityScore().score}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/shield.svg" />}
            chart={{
              categories: ['Security Score'],
              series: [securityScore().score],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Threat Detection Rate"
            percent={threatDetectionRate().rate}
            total={threatDetectionRate().rate}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/danger.svg" />}
            chart={{
              categories: ['Detection Rate'],
              series: [threatDetectionRate().rate],
            }}
          />
        </Grid>

        {/* Main Security Charts */}
        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="All Threat Types Over Time"
            subheader="Complete threat detection timeline by type"
            chart={websiteVisitsData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Security Status Overview"
            chart={currentVisitsData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Threat Analysis by Type"
            subheader="Safe Logs vs Threats Detected by Type"
            chart={conversionRatesData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title="Threat Distribution"
            subheader="Safe vs Unsafe Logs by Type"
            chart={currentSubjectData()}
          />
        </Grid>

        {/* Removed News, Order timeline, Traffic by site, and Tasks components */}
      </Grid>
    </DashboardContent>
  );
}
