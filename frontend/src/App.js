import React, { useState } from 'react';
import './App.css';
import logo from './logo.svg';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      setError('Please enter at least one URL');
      setLoading(false);
      return;
    }
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${apiUrl}/api/pagerank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="PageRank Logo" />
        <h1>PageRank Calculator</h1>
        <p>Calculate PageRank scores for your web pages using the Google algorithm</p>
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit}>
          <div className="input-section">
            <label htmlFor="urls">Enter URLs (one per line):</label>
            <textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example.com&#10;https://example.org&#10;https://example.net"
              rows="6"
            />
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'left' }}>
              💡 <strong>Tip:</strong> Enter the URLs you want to analyze. The algorithm will calculate PageRank scores based on the links between these pages.
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

        {results.length > 0 && (
          <div className="results">
            <h2>PageRank Results</h2>
            <p style={{ marginBottom: '20px', color: '#666', textAlign: 'left' }}>
              📊 PageRank scores indicate the relative importance of each page. Higher scores mean more important pages.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>URL</th>
                  <th>PageRank Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
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
                      <strong style={{ color: '#1976D2' }}>{result.rank.toFixed(4)}</strong>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}

export default App;
