import React, { useState } from 'react';
import './App.css';
import logo from './logo.webp';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  const [mode, setMode] = useState('urls'); // 'urls' or 'matrix'
  const [urls, setUrls] = useState('');
  const [adjacencyMatrix, setAdjacencyMatrix] = useState('');
  const [dampingFactor, setDampingFactor] = useState(0.85);
  const [maxIterations, setMaxIterations] = useState(100);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      let requestBody = {
        damping_factor: dampingFactor,
        max_iterations: maxIterations
      };

      if (mode === 'urls') {
        const urlList = urls.split('\n').filter(url => url.trim());
        
        if (urlList.length === 0) {
          setError('Please enter at least one URL');
          setLoading(false);
          return;
        }
        
        requestBody.urls = urlList;
        
        const response = await fetch(`${apiUrl}/api/pagerank`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setResults(data.results);
          setSuccess(`Successfully calculated PageRank for ${data.total_urls} URLs`);
        } else {
          setError(data.error || 'An error occurred');
        }
      } else {
        // Matrix mode
        const urlList = urls.split('\n').filter(url => url.trim());
        
        if (urlList.length === 0) {
          setError('Please enter at least one URL');
          setLoading(false);
          return;
        }
        
        let matrix;
        try {
          matrix = JSON.parse(adjacencyMatrix);
        } catch (e) {
          setError('Invalid adjacency matrix format. Please enter a valid JSON array.');
          setLoading(false);
          return;
        }
        
        if (!Array.isArray(matrix) || matrix.length !== urlList.length) {
          setError(`Adjacency matrix must be a ${urlList.length}x${urlList.length} array`);
          setLoading(false);
          return;
        }
        
        requestBody.urls = urlList;
        requestBody.adjacency_matrix = matrix;
        
        const response = await fetch(`${apiUrl}/api/pagerank-matrix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setResults(data.results);
          setSuccess(`Successfully calculated PageRank for ${data.total_urls} URLs using custom matrix`);
        } else {
          setError(data.error || 'An error occurred');
        }
      }
    } catch (err) {
      setError('Failed to connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const generateExampleMatrix = () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    if (urlList.length === 0) {
      setError('Please enter URLs first');
      return;
    }
    
    const n = urlList.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    
    // Generate a simple example matrix with some connections
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && Math.random() > 0.5) {
          matrix[i][j] = 1;
        }
      }
    }
    
    setAdjacencyMatrix(JSON.stringify(matrix, null, 2));
  };

  const chartData = {
    labels: results.map(r => r.url),
    datasets: [
      {
        label: 'PageRank Score',
        data: results.map(r => r.rank),
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 0.1,
          color: '#1976D2',
          font: {
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(33, 150, 243, 0.1)',
          drawBorder: false,
        },
        border: {
          color: 'rgba(33, 150, 243, 0.2)',
        }
      },
      x: {
        ticks: {
          color: '#1976D2',
          font: {
            weight: '600'
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: 'rgba(33, 150, 243, 0.1)',
          drawBorder: false,
        },
        border: {
          color: 'rgba(33, 150, 243, 0.2)',
        }
      }
    }
  };

  return (
    <div className="App">
      <header className="hcmus-header">
        <div className="hcmus-header-content">
          <img src={logo} className="hcmus-logo" alt="HCMUS Logo" />
          <div>
            <h1 className="hcmus-title">PageRank System</h1>
            <div className="hcmus-subtitle">University of Science, VNU-HCM (HCMUS)</div>
          </div>
        </div>
      </header>
      <nav className="hcmus-navbar">
        <ul>
          <li className="active">Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>
      <main className="App-main hcmus-main">
        <form onSubmit={handleSubmit}>
          <div className="input-section">
            <label>Calculation Mode:</label>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '20px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  value="urls"
                  checked={mode === 'urls'}
                  onChange={(e) => setMode(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                🕷️ Crawl URLs Automatically
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  value="matrix"
                  checked={mode === 'matrix'}
                  onChange={(e) => setMode(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                📊 Manual Adjacency Matrix
              </label>
            </div>

            <label htmlFor="urls">URLs (one per line):</label>
            <textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://google.com&#10;https://youtube.com&#10;https://github.com&#10;https://stackoverflow.com&#10;https://wikipedia.org"
              rows="6"
            />
            
            {mode === 'matrix' && (
              <>
                <label htmlFor="matrix" style={{ marginTop: '20px' }}>Adjacency Matrix (JSON format):</label>
                <textarea
                  id="matrix"
                  value={adjacencyMatrix}
                  onChange={(e) => setAdjacencyMatrix(e.target.value)}
                  placeholder="[[0,1,1,0,0],&#10;[1,0,0,1,0],&#10;[0,1,0,1,1],&#10;[0,0,1,0,1],&#10;[1,0,0,1,0]]"
                  rows="8"
                />
                <button 
                  type="button" 
                  onClick={generateExampleMatrix}
                  style={{ marginTop: '10px', backgroundColor: '#4CAF50' }}
                >
                  🎲 Generate Example Matrix
                </button>
              </>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <label htmlFor="damping">Damping Factor (α):</label>
                <input
                  id="damping"
                  type="number"
                  min="0.1"
                  max="0.99"
                  step="0.01"
                  value={dampingFactor}
                  onChange={(e) => setDampingFactor(parseFloat(e.target.value))}
                  style={{ 
                    width: '100px', 
                    padding: '8px', 
                    border: '2px solid #e3f2fd', 
                    borderRadius: '4px',
                    marginLeft: '10px'
                  }}
                />
                <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                  Default: 0.85 (Google's standard)
                </small>
              </div>
              
              <div>
                <label htmlFor="iterations">Max Iterations:</label>
                <input
                  id="iterations"
                  type="number"
                  min="10"
                  max="1000"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                  style={{ 
                    width: '100px', 
                    padding: '8px', 
                    border: '2px solid #e3f2fd', 
                    borderRadius: '4px',
                    marginLeft: '10px'
                  }}
                />
                <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                  Default: 100
                </small>
              </div>
            </div>

            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666', textAlign: 'left' }}>
              {mode === 'urls' ? (
                <>
                  💡 <strong>URL Mode:</strong> The algorithm will automatically crawl each URL to find links between pages and calculate PageRank scores.
                </>
              ) : (
                <>
                  💡 <strong>Matrix Mode:</strong> You can manually specify the adjacency matrix to control exactly which pages link to each other.
                </>
              )}
            </p>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span>
                Calculating PageRank...
              </>
            ) : (
              'Calculate PageRank'
            )}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {results.length > 0 && (
          <div className="results">
            <h2>PageRank Results</h2>
            <p style={{ marginBottom: '20px', color: '#666', textAlign: 'left' }}>
              📊 PageRank scores indicate the relative importance of each page. Higher scores mean more important pages.
              <br />
              <strong>Parameters used:</strong> Damping Factor = {dampingFactor}, Max Iterations = {maxIterations}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>URL</th>
                  <th>PageRank Score</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const percentage = ((result.rank / results.reduce((sum, r) => sum + r.rank, 0)) * 100).toFixed(2);
                  return (
                    <tr key={result.url}>
                      <td>
                        <strong style={{ color: '#1976D2' }}>#{index + 1}</strong>
                      </td>
                      <td>
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="App-link">
                          {result.url}
                        </a>
                      </td>
                      <td>
                        <strong style={{ color: '#1976D2' }}>{result.rank.toFixed(6)}</strong>
                      </td>
                      <td>
                        <span style={{ color: '#4CAF50', fontWeight: '600' }}>{percentage}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {results.length > 0 && (
          <div className="chart-container">
            <h3>PageRank Score Visualization</h3>
            <div style={{ height: '400px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </main>
      <footer className="hcmus-footer">
        <div>© {new Date().getFullYear()} University of Science, VNU-HCM | PageRank System</div>
        <div>Contact: <a href="mailto:info@hcmus.edu.vn">info@hcmus.edu.vn</a></div>
      </footer>
    </div>
  );
}

export default App;
