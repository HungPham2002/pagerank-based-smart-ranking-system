import React from 'react';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import './NetworkMetrics.css';

// Register components (chỉ cần register một lần, nhưng để chắc chắn)
ChartJS.register(
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const NetworkMetrics = ({ metrics, results }) => {
  if (!metrics) return null;

  // Prepare data for In-Degree Distribution chart
  const inDegreeData = {
    labels: results.map((r, i) => `#${i + 1}`),
    datasets: [{
      label: 'In-Degree',
      data: metrics.in_degree,
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  // Prepare data for Out-Degree Distribution chart
  const outDegreeData = {
    labels: results.map((r, i) => `#${i + 1}`),
    datasets: [{
      label: 'Out-Degree',
      data: metrics.out_degree,
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  // Prepare data for Node Types Doughnut
  const nodeTypesData = {
    labels: ['Strongly Connected', 'Dangling Nodes', 'Isolated Nodes', 'Others'],
    datasets: [{
      data: [
        metrics.strongly_connected_nodes,
        metrics.dangling_nodes,
        metrics.isolated_nodes,
        Math.max(0, metrics.total_nodes - metrics.strongly_connected_nodes - metrics.dangling_nodes - metrics.isolated_nodes)
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(201, 203, 207, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Prepare Radar chart for top 5 nodes (PageRank, Hub, Authority, In-Degree, Out-Degree)
  const topNodes = results.slice(0, 5);
  const radarData = {
    labels: ['PageRank', 'Hub Score', 'Authority Score', 'In-Degree', 'Out-Degree'],
    datasets: topNodes.map((result, idx) => {
      const colors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ];
      
      return {
        label: result.url.length > 20 ? result.url.substring(0, 20) + '...' : result.url,
        data: [
          result.rank * 10, // Scale PageRank for visibility
          metrics.hub_scores[idx] * 10,
          metrics.authority_scores[idx] * 10,
          metrics.in_degree[idx],
          metrics.out_degree[idx]
        ],
        backgroundColor: colors[idx],
        borderColor: colors[idx].replace('0.6', '1'),
        borderWidth: 2
      };
    })
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: { stepSize: 2 }
      }
    }
  };

  return (
    <div className="network-metrics-container">
      <div className="metrics-header">
        <h3>🔢 Network Metrics Panel</h3>
        <p className="metrics-description">
          💡 Comprehensive analysis of network structure, connectivity, and node importance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-icon">🌐</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.total_nodes}</div>
            <div className="metric-label">Total Nodes</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔗</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.total_edges}</div>
            <div className="metric-label">Total Edges</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">{(metrics.density * 100).toFixed(1)}%</div>
            <div className="metric-label">Network Density</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.avg_clustering_coefficient.toFixed(3)}</div>
            <div className="metric-label">Avg Clustering</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📥</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.avg_in_degree.toFixed(1)}</div>
            <div className="metric-label">Avg In-Degree</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📤</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.avg_out_degree.toFixed(1)}</div>
            <div className="metric-label">Avg Out-Degree</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="metrics-charts-grid">
        {/* In-Degree Distribution */}
        <div className="chart-box">
          <h4>In-Degree Distribution</h4>
          <p className="chart-description">Number of incoming links to each node</p>
          <div style={{ height: '300px' }}>
            <Bar data={inDegreeData} options={chartOptions} />
          </div>
        </div>

        {/* Out-Degree Distribution */}
        <div className="chart-box">
          <h4>Out-Degree Distribution</h4>
          <p className="chart-description">Number of outgoing links from each node</p>
          <div style={{ height: '300px' }}>
            <Bar data={outDegreeData} options={chartOptions} />
          </div>
        </div>

        {/* Node Types Breakdown */}
        <div className="chart-box">
          <h4>Node Types Distribution</h4>
          <p className="chart-description">Classification of nodes by connectivity</p>
          <div style={{ height: '300px' }}>
            <Doughnut data={nodeTypesData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Multi-Metric Radar */}
        <div className="chart-box">
          <h4>Top 5 Nodes - Multi-Metric Analysis</h4>
          <p className="chart-description">Comprehensive comparison of top-ranked nodes</p>
          <div style={{ height: '300px' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

      {/* Hubs and Authorities */}
      <div className="hub-authority-section">
        <div className="hub-box">
          <h4>🌟 Top Hubs (High Out-Degree)</h4>
          <p className="section-description">Nodes that link to many other pages</p>
          {metrics.hubs.length > 0 ? (
            <ul className="hub-list">
              {metrics.hubs.map((hub, idx) => (
                <li key={idx}>
                  <span className="rank-badge">#{idx + 1}</span>
                  <a href={hub.url} target="_blank" rel="noopener noreferrer" className="hub-url">
                    {hub.url}
                  </a>
                  <span className="hub-score">
                    📤 {hub.out_degree} links | Score: {(hub.score * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No significant hubs detected</p>
          )}
        </div>

        <div className="authority-box">
          <h4>👑 Top Authorities (High In-Degree)</h4>
          <p className="section-description">Nodes that receive links from many pages</p>
          {metrics.authorities.length > 0 ? (
            <ul className="authority-list">
              {metrics.authorities.map((auth, idx) => (
                <li key={idx}>
                  <span className="rank-badge gold">#{idx + 1}</span>
                  <a href={auth.url} target="_blank" rel="noopener noreferrer" className="authority-url">
                    {auth.url}
                  </a>
                  <span className="authority-score">
                    📥 {auth.in_degree} links | Score: {(auth.score * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No significant authorities detected</p>
          )}
        </div>
      </div>

      {/* Insights Panel */}
      <div className="insights-panel">
        <h4>💡 Network Insights</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-icon">
              {metrics.density > 0.5 ? '✅' : metrics.density > 0.2 ? '⚠️' : '❌'}
            </span>
            <div>
              <strong>Density: {(metrics.density * 100).toFixed(1)}%</strong>
              <p>
                {metrics.density > 0.5
                  ? 'Highly connected network with strong inter-linking'
                  : metrics.density > 0.2
                  ? 'Moderately connected network'
                  : 'Sparse network with limited connections'}
              </p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon">
              {metrics.dangling_nodes === 0 ? '✅' : '⚠️'}
            </span>
            <div>
              <strong>{metrics.dangling_nodes} Dangling Node(s)</strong>
              <p>
                {metrics.dangling_nodes === 0
                  ? 'All nodes have outbound links - good link structure'
                  : `${metrics.dangling_nodes} node(s) have no outbound links - may need attention`}
              </p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon">
              {metrics.isolated_nodes === 0 ? '✅' : '❌'}
            </span>
            <div>
              <strong>{metrics.isolated_nodes} Isolated Node(s)</strong>
              <p>
                {metrics.isolated_nodes === 0
                  ? 'No isolated nodes - fully connected network'
                  : `${metrics.isolated_nodes} node(s) are completely isolated`}
              </p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon">
              {metrics.avg_clustering_coefficient > 0.6 ? '✅' : metrics.avg_clustering_coefficient > 0.3 ? '⚠️' : '❌'}
            </span>
            <div>
              <strong>Clustering: {metrics.avg_clustering_coefficient.toFixed(3)}</strong>
              <p>
                {metrics.avg_clustering_coefficient > 0.6
                  ? 'High clustering - nodes form tight communities'
                  : metrics.avg_clustering_coefficient > 0.3
                  ? 'Moderate clustering - some community structure'
                  : 'Low clustering - nodes are loosely connected'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMetrics;