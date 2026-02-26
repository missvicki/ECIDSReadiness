'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import Container from '@/components/layout/Container';

export default function CohortExplorerPage() {
  const [data, setData] = useState<ChildWithRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    county: 'All Counties',
    district: 'All Districts',
    riskTier: 'All Risk Tiers',
    povertyLevel: 'All Poverty Levels',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('composite_risk_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    loadAllData().then((loadedData) => {
      setData(loadedData);
      setLoading(false);
    });
  }, []);

  const filteredData = filterData(data, filters);

  // Search filter
  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredData;
    return filteredData.filter(child =>
      child['Child DCN'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.AddressCountyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredData, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...searchedData].sort((a, b) => {
      let aVal = a[sortColumn as keyof ChildWithRisk];
      let bVal = b[sortColumn as keyof ChildWithRisk];

      // Handle null values
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchedData, sortColumn, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cohort data...</p>
        </div>
      </Container>
    );
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getTopRiskDrivers = (child: ChildWithRisk) => {
    const drivers: string[] = [];
    if (child.num_enrollment_gaps > 1) drivers.push(`${child.num_enrollment_gaps} enrollment gaps`);
    if (child.num_screenings_completed < 4) drivers.push(`Missed ${6 - child.num_screenings_completed} screenings`);
    if (child.avg_attendance_days < 80) drivers.push('Low attendance');
    if (child.deep_poverty) drivers.push('Deep poverty');
    if (child.num_household_stressors > 2) drivers.push(`${child.num_household_stressors} household stressors`);
    return drivers.slice(0, 3).join(', ') || 'No major drivers';
  };

  const exportToCSV = () => {
    const headers = ['Child DCN', 'County', 'Risk Score', 'Risk Tier', 'Stability', 'Engagement', 'Developmental', 'Context', 'Top Risk Drivers'];
    const rows = sortedData.map(child => [
      child['Child DCN'],
      child.AddressCountyName,
      child.composite_risk_score.toFixed(1),
      child.risk_tier,
      child.stability_score.toFixed(1),
      child.engagement_score.toFixed(1),
      child.developmental_score.toFixed(1),
      child.context_score.toFixed(1),
      `"${getTopRiskDrivers(child)}"`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort-explorer-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRiskBadgeColor = (tier: string) => {
    switch (tier) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                Showing {paginatedData.length} of {sortedData.length} children
                {sortedData.length !== filteredData.length && ` (filtered from ${filteredData.length})`}
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <span>📥</span>
              <span>Export to CSV</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Child DCN or County..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Key Finding */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-3">Cohort Explorer</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Drill down into individual child-level records</strong> to identify specific children for targeted outreach and intervention.
              Filter by risk tier, county, or poverty level, then export lists for case management and program enrollment.
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('Child DCN')}
                  >
                    Child DCN {sortColumn === 'Child DCN' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('AddressCountyName')}
                  >
                    County {sortColumn === 'AddressCountyName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('composite_risk_score')}
                  >
                    Risk Score {sortColumn === 'composite_risk_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Risk Tier
                  </th>
                  <th
                    className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('stability_score')}
                  >
                    Stability {sortColumn === 'stability_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('engagement_score')}
                  >
                    Engagement {sortColumn === 'engagement_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('developmental_score')}
                  >
                    Developmental {sortColumn === 'developmental_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('context_score')}
                  >
                    Context {sortColumn === 'context_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Top Risk Drivers
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((child, idx) => (
                  <tr
                    key={child['Child DCN']}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{child['Child DCN']}</td>
                    <td className="px-4 py-3">{child.AddressCountyName}</td>
                    <td className="px-4 py-3 text-center font-semibold">{child.composite_risk_score.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(child.risk_tier)}`}>
                        {child.risk_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{child.stability_score.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{child.engagement_score.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{child.developmental_score.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{child.context_score.toFixed(0)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{getTopRiskDrivers(child)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box mt-8">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>This table bridges analytics to action.</strong> Case managers and coordinators can identify specific high-risk
            children, understand their primary risk drivers, and export targeted lists for outreach, enrollment, or service referrals.
            The ability to drill down from population patterns to individual records makes the risk index operationally useful.
          </p>
        </div>
      </Container>
    </>
  );
}
