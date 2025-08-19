import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'src/routes/hooks';
import axios from 'src/utils/axios';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
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

  const safeLogsData = () => {
    const safeLogs = logs.filter((log) => log.isSafe);
    const months = getMonths(safeLogs);
    const series = months.map((month) =>
      safeLogs.filter((log) => log.timestamp?.startsWith(month)).length
    );

    const currentMonthCount = series[series.length - 1] || 0;
    const previousMonthCount = series[series.length - 2] || 0;
    const percent = calculatePercentChange(currentMonthCount, previousMonthCount);

    return {
      total: safeLogs.length,
      percent,
      chart: {
        categories: months,
        series,
      },
    };
  };

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

  const phishingLogsData = () => {
    const phishingLogs = logs.filter((log) => log.type === 'PHISHING');
    const months = getMonths(phishingLogs);
    const series = months.map((month) =>
      phishingLogs.filter((log) => log.timestamp?.startsWith(month)).length
    );

    const currentMonthCount = series[series.length - 1] || 0;
    const previousMonthCount = series[series.length - 2] || 0;
    const percent = calculatePercentChange(currentMonthCount, previousMonthCount);

    return {
      total: phishingLogs.length,
      percent,
      chart: {
        categories: months,
        series,
      },
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
        { name: 'Safe', data: safeCounts },
        { name: 'Unsafe', data: unsafeCounts },
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

    const phishingCounts = dates.map((date) =>
      logs.filter((log) => log.timestamp?.startsWith(date) && log.type === 'PHISHING').length
    );
    const codeSafetyCounts = dates.map((date) =>
      logs.filter((log) => log.timestamp?.startsWith(date) && log.type === 'CODE_SAFETY').length
    );

    return {
      categories: dates,
      series: [
        { name: 'PHISHING', data: phishingCounts },
        { name: 'CODE_SAFETY', data: codeSafetyCounts },
      ],
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
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Logs"
            percent={totalLogsData().percent}
            total={totalLogsData().total}
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/document.svg" />}
            chart={totalLogsData().chart}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Unsafe Logs"
            percent={unsafeLogsData().percent}
            total={unsafeLogsData().total}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/close.svg" />}
            chart={unsafeLogsData().chart}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Safe Logs"
            percent={safeLogsData().percent}
            total={safeLogsData().total}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/shield.svg" />}
            chart={safeLogsData().chart}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="PHISHING Logs"
            percent={phishingLogsData().percent}
            total={phishingLogsData().total}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/danger.svg" />}
            chart={phishingLogsData().chart}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Safe vs Unsafe Logs"
            chart={currentVisitsData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Logs Over Time"
            subheader="PHISHING vs CODE_SAFETY Logs by Date"
            chart={websiteVisitsData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Log Safety by Type"
            subheader="Safe vs Unsafe Logs by Type"
            chart={conversionRatesData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title="Safe Logs by Type"
            subheader="Distribution of Safe Logs"
            chart={currentSubjectData()}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite
            title="Traffic by site"
            list={[
              { value: 'facebook', label: 'Facebook', total: 323234 },
              { value: 'google', label: 'Google', total: 341212 },
              { value: 'linkedin', label: 'Linkedin', total: 411213 },
              { value: 'twitter', label: 'Twitter', total: 443232 },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
