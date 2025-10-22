import React, { useState } from 'react';
import './App.css';
import logo from './logo.webp';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ReactMarkdown from 'react-markdown';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const aboutContent = `# PageRank-Based Smart Ranking System

This web application implements Google’s original PageRank algorithm to compute and visualize the relative importance of web pages within a network. Users can input a set of interconnected websites, and the system automatically craws and calculates their PageRank scores through iterative computation. The project aims to simulate the core mechanism behind modern search engines, providing a hands-on understanding of how link structures influence website ranking and visibility.

## How to Use

### Crawl URLs Automatically
Enter a list of URLs (one per line). The system will automatically crawl each website, collect the links between pages, and build the adjacency matrix for PageRank calculation. Use this mode to analyze the real link structure between websites.

### Manual Adjacency Matrix
Enter the list of URLs and provide the adjacency matrix in JSON format (e.g., \`[[0,1,0],[1,0,1],[0,1,0]]\`). Use this mode for full control over the link structure or to experiment with different network topologies.

### Parameters

**Damping Factor (α)**: This parameter (default 0.85) represents the probability that a user continues clicking on links. Adjust this value (0.1 - 0.99) to simulate more or less patient users. Higher values mean PageRank depends more on the link structure.

**Max Iterations**: The maximum number of iterations for the PageRank calculation. Default is 100; increase for larger networks or higher accuracy.

## Steps to Calculate PageRank

1. Select the calculation mode (Crawl URLs or Manual Matrix)
2. Enter the list of URLs (one per line)
3. If using Manual Matrix, also enter the adjacency matrix
4. Adjust the Damping Factor and Max Iterations if needed
5. Click "Calculate PageRank" to view the results and visualization

## About HCMUT

Ho Chi Minh City University of Technology (HCMUT) is one of the leading engineering and technology universities in Vietnam, under the Vietnam National University – Ho Chi Minh City (VNU-HCM). The university is renowned for its strong focus on innovation, research, and practical applications in science and technology, providing a high-quality education environment for both undergraduate and graduate students.

## About This Project

This project was developed as part of the Intelligent Systems (CO5119) course at Ho Chi Minh City University of Technology (HCMUT) – VNU-HCM, under the supervision of Assoc. Prof. Dr. Quan Thanh Tho. It presents a practical implementation of the PageRank algorithm, a cornerstone of modern search engine technology. The project aims to design a smart ranking system that evaluates the relative importance of web pages based on their interconnections, thereby simulating how search engines (Google, etc.) determine page relevance and authority in real-world contexts.

## About Us
- **Phạm Hữu Hùng** — Postgraduate Student (ID: 2470299) • [CV (PDF)](https://github.com/HungPham2002/resume/blob/main/Resume_HungPham.pdf)
- **Võ Thị Vân Anh** — Postgraduate Student (ID: 2470283)

## Acknowledgment

The authors would like to express their sincere gratitude to BSc. Le Nho Han and collaborators for their valuable suggestions and insightful guidance throughout the research and implementation of the PageRank algorithm. Their support and expertise have greatly contributed to the successful completion of this project.

`;

function App() {
  const [mode, setMode] = useState('urls');
  const [urls, setUrls] = useState('');
  const [adjacencyMatrix, setAdjacencyMatrix] = useState('');
  const [dampingFactor, setDampingFactor] = useState(0.85);
  const [maxIterations, setMaxIterations] = useState(100);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState('home');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
          setSuccess(`✅ Successfully calculated PageRank for ${data.total_urls} URLs`);
        } else {
          setError(data.error || 'An error occurred');
        }
      } else {
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
          setError('❌ Invalid adjacency matrix format. Please enter a valid JSON array.');
          setLoading(false);
          return;
        }
        
        if (!Array.isArray(matrix) || matrix.length !== urlList.length) {
          setError(`❌ Adjacency matrix must be a ${urlList.length}x${urlList.length} array`);
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
          setSuccess(`✅ Successfully calculated PageRank for ${data.total_urls} URLs using custom matrix`);
        } else {
          setError(data.error || 'An error occurred');
        }
      }
    } catch (err) {
      setError('❌ Failed to connect to the server. Please make sure the backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const generateExampleMatrix = () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    if (urlList.length === 0) {
      setError('❌ Please enter URLs first');
      return;
    }
    
    const n = urlList.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && Math.random() > 0.5) {
          matrix[i][j] = 1;
        }
      }
    }
    
    setAdjacencyMatrix(JSON.stringify(matrix, null, 2));
    setSuccess('✅ Example matrix generated successfully!');
  };

  const chartData = {
    labels: results.map(r => r.url.length > 30 ? r.url.substring(0, 30) + '...' : r.url),
    datasets: [
      {
        label: 'PageRank Score',
        data: results.map(r => r.rank),
        backgroundColor: 'rgba(0, 71, 171, 0.8)',
        borderColor: '#0047AB',
        borderWidth: 2,
        borderRadius: 10,
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
        backgroundColor: 'rgba(0, 71, 171, 0.95)',
        titleColor: '#FFD700',
        bodyColor: 'white',
        borderColor: '#FFD700',
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: false,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 0.1,
          color: '#0047AB',
          font: {
            weight: '600',
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 71, 171, 0.1)',
          drawBorder: false,
        },
        border: {
          color: 'rgba(0, 71, 171, 0.3)',
        }
      },
      x: {
        ticks: {
          color: '#0047AB',
          font: {
            weight: '600',
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: 'rgba(0, 71, 171, 0.1)',
          drawBorder: false,
        },
        border: {
          color: 'rgba(0, 71, 171, 0.3)',
        }
      }
    }
  };

  return (
    <div className="App">
      <header className="hcmus-header">
        <div className="hcmus-header-content">
          <img src={logo} className="hcmus-logo" alt="HCMUT Logo" />
          <div>
            <h1 className="hcmus-title">PageRank-Based Smart Ranking System</h1>
            <div className="hcmus-subtitle">Ho Chi Minh City University of Technology (HCMUT) - VNUHCM</div>
          </div>
        </div>
      </header>
      <nav className="hcmus-navbar">
        <ul>
          <li className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>🏠 Home</li>
          <li className={page === 'about' ? 'active' : ''} onClick={() => setPage('about')}>📖 About</li>
          <li><a href="mailto:contact@hcmut.edu.vn" style={{ color: 'inherit', textDecoration: 'none' }}>📧 Contact</a></li>
        </ul>
      </nav>
      <main className="App-main hcmus-main">
        {page === 'about' ? (
          <div className="input-section" style={{ maxWidth: 1000, margin: '0 auto', background: '#fafbff' }}>
            <ReactMarkdown>{aboutContent}</ReactMarkdown>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-section">
              <label>🔧 Calculation Mode:</label>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ marginRight: '28px', cursor: 'pointer', fontSize: '1.05em' }}>
                  <input
                    type="radio"
                    name="mode"
                    value="urls"
                    checked={mode === 'urls'}
                    onChange={(e) => setMode(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  🌐 Crawl URLs Automatically
                </label>
                <label style={{ cursor: 'pointer', fontSize: '1.05em' }}>
                  <input
                    type="radio"
                    name="mode"
                    value="matrix"
                    checked={mode === 'matrix'}
                    onChange={(e) => setMode(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  📊 Manual Adjacency Matrix
                </label>
              </div>

              <label htmlFor="urls">🔗 URLs (one per line):</label>
              <textarea
                id="urls"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://google.com&#10;https://youtube.com&#10;https://github.com&#10;https://stackoverflow.com&#10;https://wikipedia.org"
                rows="6"
              />
              
              {mode === 'matrix' && (
                <>
                  <label htmlFor="matrix" style={{ marginTop: '24px' }}>📐 Adjacency Matrix (JSON format):</label>
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
                    style={{ backgroundColor: '#FFD700', color: '#ffffffff', fontWeight: '700' }}
                  >
                    🎲 Generate Example Matrix
                  </button>
                </>
              )}

              <div style={{ marginTop: '28px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label htmlFor="damping">⚙️ Damping Factor (α):</label>
                  <input
                    id="damping"
                    type="number"
                    min="0.1"
                    max="0.99"
                    step="0.01"
                    value={dampingFactor}
                    onChange={(e) => setDampingFactor(parseFloat(e.target.value))}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #e8f0fe', 
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}
                  />
                  <small style={{ display: 'block', color: '#666', marginTop: '6px' }}>
                    📌 Default: 0.85 (Google's standard)
                  </small>
                </div>
                
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label htmlFor="iterations">🔄 Max Iterations:</label>
                  <input
                    id="iterations"
                    type="number"
                    min="10"
                    max="1000"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #e8f0fe', 
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}
                  />
                  <small style={{ display: 'block', color: '#666', marginTop: '6px' }}>
                    📌 Default: 100
                  </small>
                </div>
              </div>

              <p style={{ marginTop: '20px', fontSize: '15px', color: '#555', textAlign: 'left', background: '#f5f9ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0047AB' }}>
                {mode === 'urls' ? (
                  <>
                    💡 <strong>URL Mode:</strong> The algorithm will automatically crawl each URL to find links between pages and calculate PageRank scores based on the real link structure.
                  </>
                ) : (
                  <>
                    💡 <strong>Matrix Mode:</strong> You can manually specify the adjacency matrix to control exactly which pages link to each other. This is useful for testing specific network topologies.
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
                '🚀 Calculate PageRank'
              )}
            </button>
          </form>
        )}

        {error && <div className="error">❌ {error}</div>}
        {success && <div className="success">✅ {success}</div>}

        {results.length > 0 && (
          <div className="results">
            <h2>📊 PageRank Results</h2>
            <p style={{ marginBottom: '24px', color: '#555', textAlign: 'left', background: '#f5f9ff', padding: '16px', borderRadius: '8px' }}>
              📈 PageRank scores indicate the relative importance of each page in the network. Higher scores mean more important pages based on the link structure.
              <br />
              <strong>Parameters used:</strong> Damping Factor (α) = {dampingFactor}, Max Iterations = {maxIterations}
            </p>
            <table>
              <thead>
                <tr>
                  <th>🏆 Rank</th>
                  <th>🔗 URL</th>
                  <th>📊 PageRank Score</th>
                  <th>📈 Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const percentage = ((result.rank / results.reduce((sum, r) => sum + r.rank, 0)) * 100).toFixed(2);
                  const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                  return (
                    <tr key={result.url}>
                      <td>
                        <strong style={{ color: '#0047AB', fontSize: '1.1em' }}>{medalEmoji} #{index + 1}</strong>
                      </td>
                      <td>
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="App-link">
                          {result.url}
                        </a>
                      </td>
                      <td>
                        <strong style={{ color: '#0047AB', fontSize: '1.05em' }}>{result.rank.toFixed(6)}</strong>
                      </td>
                      <td>
                        <span style={{ color: '#2e7d32', fontWeight: '700', fontSize: '1.05em' }}>{percentage}%</span>
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
            <h3>📊 PageRank Score Visualization</h3>
            <div style={{ height: '450px', marginTop: '20px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </main>
      <footer className="hcmus-footer">
        <div style={{ marginBottom: '8px', fontSize: '1.05em', fontWeight: '600' }}>
          © {new Date().getFullYear()} Ho Chi Minh City University of Technology (HCMUT) | PageRank-Based Smart Ranking System
        </div>
        <div>
          Contact: <a href="mailto:contact@hcmut.edu.vn">contact@hcmut.edu.vn</a> | 
          Website: <a href="https://www.hcmut.edu.vn" target="_blank" rel="noopener noreferrer">www.hcmut.edu.vn</a>
        </div>
      </footer>
    </div>
  );
}

export default App;