import * as AnalyticsService from '../services/AnalyticsService.js';

export function getOverview(req, res) {
  const overview = AnalyticsService.getOverview();
  res.json({ success: true, data: overview });
}

export function getTrends(req, res) {
  const trends = AnalyticsService.getTrends();
  res.json({ success: true, data: trends });
}

export function getMachineAnalytics(req, res) {
  const analytics = AnalyticsService.getMachineAnalytics(req.params.machineId);
  if (!analytics) return res.status(404).json({ success: false, error: 'No analytics data' });
  res.json({ success: true, data: analytics });
}
