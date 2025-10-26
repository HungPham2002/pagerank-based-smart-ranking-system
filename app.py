from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import numpy as np
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse, urljoin
import logging
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_valid_url(url):
    """Kiểm tra URL có hợp lệ không"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def normalize_url(url):
    """Chuẩn hóa URL: loại bỏ fragment, query params, trailing slash"""
    try:
        parsed = urlparse(url)
        # Loại bỏ fragment và query parameters
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        # Loại bỏ trailing slash
        if normalized.endswith('/') and len(normalized) > 1:
            normalized = normalized[:-1]
        return normalized
    except:
        return url

def extract_links(url):
    """Crawl và trích xuất tất cả links từ một trang web"""
    if not is_valid_url(url):
        logger.warning(f"Invalid URL: {url}")
        return []
        
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, timeout=15, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        links = []
        
        # Tìm tất cả thẻ anchor
        for link in soup.find_all('a'):
            href = link.get('href')
            if href:
                # Xử lý URL tương đối
                if href.startswith('/'):
                    # Chuyển URL tương đối thành tuyệt đối
                    absolute_url = urljoin(url, href)
                elif href.startswith('http'):
                    # URL tuyệt đối
                    absolute_url = href
                else:
                    # Bỏ qua URL tương đối không bắt đầu bằng /
                    continue
                
                # Chuẩn hóa URL
                normalized_url = normalize_url(absolute_url)
                links.append(normalized_url)
        
        # Loại bỏ duplicates
        unique_links = list(dict.fromkeys(links))
        logger.info(f"Found {len(unique_links)} unique links from {url}")
        return unique_links
        
    except requests.exceptions.Timeout:
        logger.error(f"Timeout while fetching {url}")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching {url}: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error while processing {url}: {str(e)}")
        return []

def build_adjacency_matrix(urls):
    """Xây dựng ma trận kề từ danh sách URLs"""
    n = len(urls)
    adjacency_matrix = [[0] * n for _ in range(n)]
    url_to_index = {url: i for i, url in enumerate(urls)}
    
    total_links_found = 0
    total_edges_added = 0
    
    for i, url in enumerate(urls):
        logger.info(f"Crawling {url}...")
        links = extract_links(url)
        total_links_found += len(links)
        
        # Đếm số link đến các trang trong danh sách
        outbound_count = 0
        for link in links:
            if link in url_to_index:
                j = url_to_index[link]
                adjacency_matrix[i][j] = 1
                outbound_count += 1
                total_edges_added += 1
                logger.info(f"Added edge: {url} -> {link}")
        
        # Nếu không có outbound link, đánh dấu là dangling node
        if outbound_count == 0:
            logger.warning(f"Dangling node detected: {url} has no outbound links")
    
    logger.info(f"Total links found: {total_links_found}")
    logger.info(f"Total edges added to graph: {total_edges_added}")
    
    return adjacency_matrix, url_to_index

def calculate_pagerank_from_matrix(adjacency_matrix, urls, damping_factor=0.85, max_iterations=100, tolerance=1e-6):
    n = len(urls)
    
    # Xác định dangling nodes
    dangling_nodes = [i for i in range(n) if sum(adjacency_matrix[i]) == 0]
    
    # Xây dựng transition matrix (KHÔNG xử lý dangling ở đây)
    transition_matrix = np.zeros((n, n))
    for i in range(n):
        row_sum = sum(adjacency_matrix[i])
        if row_sum > 0:
            for j in range(n):
                transition_matrix[j][i] = adjacency_matrix[i][j] / row_sum
    
    # Initialize PageRank
    pagerank = np.ones(n) / n
    
    for iteration in range(max_iterations):
        # Tính dangling contribution
        dangling_contrib = sum(pagerank[i] for i in dangling_nodes)
        
        # Tính PageRank mới
        new_pagerank = (1 - damping_factor) / n * np.ones(n)
        new_pagerank += damping_factor * (transition_matrix @ pagerank + dangling_contrib / n * np.ones(n))
        
        # Normalize
        new_pagerank = new_pagerank / np.sum(new_pagerank)
        
        # Check convergence
        if np.linalg.norm(new_pagerank - pagerank, 1) < tolerance:
            logger.info(f"Converged after {iteration + 1} iterations")
            break
            
        pagerank = new_pagerank
    
    results = [(urls[i], float(pagerank[i])) for i in range(n)]
    results.sort(key=lambda x: x[1], reverse=True)
    return results

def calculate_pagerank(urls, damping_factor=0.85, max_iterations=100):
    """Tính PageRank cho danh sách URLs"""
    if not urls:
        raise ValueError("No URLs provided")
    
    # Xây dựng ma trận kề
    adjacency_matrix, url_to_index = build_adjacency_matrix(urls)
    
    # Tính PageRank
    return calculate_pagerank_from_matrix(adjacency_matrix, urls, damping_factor, max_iterations)

# Add a route for the root path
@app.route('/', methods=['GET'])
def home():
    return """
    <html>
    <head>
        <title>PageRank API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
            pre { background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
            h3 { margin-top: 20px; }
        </style>
    </head>
    <body>
        <h1>PageRank API</h1>
        <p>This is a PageRank calculation API server.</p>
        
        <h2>Available Endpoints:</h2>
        
        <h3>1. Calculate PageRank for URLs</h3>
        <code>POST /api/pagerank</code>
        <p>Calculates PageRank for a list of URLs by crawling their content and building a link graph.</p>
        <p>Example request:</p>
        <pre>
{
  "urls": [
    "https://example.com",
    "https://example.org"
  ],
  "damping_factor": 0.85,
  "max_iterations": 100
}
        </pre>
        
        <h3>2. Calculate PageRank with Custom Matrix</h3>
        <code>POST /api/pagerank-matrix</code>
        <p>Calculates PageRank using a custom adjacency matrix.</p>
        <p>Example request:</p>
        <pre>
{
  "urls": [
    "https://example.com",
    "https://example.org"
  ],
  "adjacency_matrix": [
    [0, 1],
    [1, 0]
  ],
  "damping_factor": 0.85,
  "max_iterations": 100
}
        </pre>
    </body>
    </html>
    """

@app.route('/api/pagerank', methods=['POST'])
def pagerank():
    """API endpoint để tính PageRank"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        urls = data.get('urls', [])
        if not urls:
            return jsonify({'error': 'No URLs provided'}), 400
        
        # Lấy các tham số tùy chọn
        damping_factor = data.get('damping_factor', 0.85)
        max_iterations = data.get('max_iterations', 100)
        
        # Validate URLs
        valid_urls = [url for url in urls if is_valid_url(url)]
        if not valid_urls:
            return jsonify({'error': 'No valid URLs provided'}), 400
        
        # Chuẩn hóa URLs
        normalized_urls = [normalize_url(url) for url in valid_urls]
        
        # Loại bỏ duplicates
        unique_urls = list(dict.fromkeys(normalized_urls))
        
        if len(unique_urls) != len(normalized_urls):
            logger.info(f"Removed {len(normalized_urls) - len(unique_urls)} duplicate URLs")
        
        # Xây dựng ma trận kề
        adjacency_matrix, url_to_index = build_adjacency_matrix(unique_urls)
        
        # Tính PageRank
        results = calculate_pagerank_from_matrix(adjacency_matrix, unique_urls, damping_factor, max_iterations)
        
        network_metrics = calculate_network_metrics(adjacency_matrix, unique_urls)

        return jsonify({
            'results': [{'url': url, 'rank': float(rank)} for url, rank in results],
            'total_urls': len(unique_urls),
            'damping_factor': damping_factor,
            'max_iterations': max_iterations,
            'adjacency_matrix': adjacency_matrix,
            'network_metrics': network_metrics
        })
        
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/pagerank-matrix', methods=['POST'])
def pagerank_matrix():
    """API endpoint để tính PageRank từ ma trận kề thủ công"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        urls = data.get('urls', [])
        adjacency_matrix = data.get('adjacency_matrix', [])
        
        if not urls or not adjacency_matrix:
            return jsonify({'error': 'URLs and adjacency matrix are required'}), 400
        
        if len(adjacency_matrix) != len(urls):
            return jsonify({'error': 'Adjacency matrix size must match number of URLs'}), 400
        
        damping_factor = data.get('damping_factor', 0.85)
        max_iterations = data.get('max_iterations', 100)
        
        results = calculate_pagerank_from_matrix(adjacency_matrix, urls, damping_factor, max_iterations)
        
        network_metrics = calculate_network_metrics(adjacency_matrix, urls)

        return jsonify({
            'results': [{'url': url, 'rank': float(rank)} for url, rank in results],
            'total_urls': len(urls),
            'damping_factor': damping_factor,
            'max_iterations': max_iterations,
            'adjacency_matrix': adjacency_matrix,
            'network_metrics': network_metrics
        })
        
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


def calculate_network_metrics(adjacency_matrix, urls):
    """Tính toán các metrics của network"""
    n = len(urls)
    
    # Convert to numpy for easier computation
    adj_matrix = np.array(adjacency_matrix)
    
    # 1. In-degree and Out-degree
    in_degree = adj_matrix.sum(axis=0).tolist()  # Sum columns
    out_degree = adj_matrix.sum(axis=1).tolist()  # Sum rows
    
    # 2. Network Density
    total_possible_edges = n * (n - 1)  # Directed graph
    total_edges = adj_matrix.sum()
    density = float(total_edges / total_possible_edges) if total_possible_edges > 0 else 0
    
    # 3. Average Degree
    avg_in_degree = float(np.mean(in_degree)) if n > 0 else 0
    avg_out_degree = float(np.mean(out_degree)) if n > 0 else 0
    
    # 4. Degree Distribution
    degree_distribution = {}
    for degree in in_degree:
        degree_distribution[int(degree)] = degree_distribution.get(int(degree), 0) + 1
    
    # 5. Identify Hub and Authority nodes
    # Simple heuristic: high out-degree = hub, high in-degree = authority
    max_out_degree = max(out_degree) if out_degree else 0
    max_in_degree = max(in_degree) if in_degree else 0
    
    hubs = []
    authorities = []
    
    for i, url in enumerate(urls):
        if out_degree[i] >= max_out_degree * 0.7 and max_out_degree > 0:  # Top 30% out-degree
            hubs.append({
                'url': url,
                'out_degree': int(out_degree[i]),
                'score': float(out_degree[i] / max_out_degree) if max_out_degree > 0 else 0
            })
        
        if in_degree[i] >= max_in_degree * 0.7 and max_in_degree > 0:  # Top 30% in-degree
            authorities.append({
                'url': url,
                'in_degree': int(in_degree[i]),
                'score': float(in_degree[i] / max_in_degree) if max_in_degree > 0 else 0
            })
    
    # 6. Clustering Coefficient (local clustering for each node)
    clustering_coefficients = []
    for i in range(n):
        neighbors = [j for j in range(n) if adj_matrix[i][j] > 0]
        k = len(neighbors)
        
        if k < 2:
            clustering_coefficients.append(0.0)
            continue
        
        # Count edges between neighbors
        edges_between_neighbors = 0
        for j in neighbors:
            for m in neighbors:
                if j != m and adj_matrix[j][m] > 0:
                    edges_between_neighbors += 1
        
        # Clustering coefficient = actual edges / possible edges
        possible_edges = k * (k - 1)
        clustering = edges_between_neighbors / possible_edges if possible_edges > 0 else 0
        clustering_coefficients.append(float(clustering))
    
    avg_clustering = float(np.mean(clustering_coefficients)) if clustering_coefficients else 0
    
    # 7. Strongly Connected Components (simplified)
    # For simplicity, we'll count nodes with both in and out edges
    strongly_connected = sum(1 for i in range(n) if in_degree[i] > 0 and out_degree[i] > 0)
    
    # 8. Isolated Nodes (no connections)
    isolated_nodes = sum(1 for i in range(n) if in_degree[i] == 0 and out_degree[i] == 0)
    
    # 9. Dangling Nodes (no outbound links)
    dangling_nodes = sum(1 for i in range(n) if out_degree[i] == 0)
    
    # 10. Calculate HITS Algorithm (simplified version)
    hub_scores, authority_scores = calculate_hits_scores(adj_matrix, n)
    
    return {
        'total_nodes': n,
        'total_edges': int(total_edges),
        'density': round(density, 4),
        'avg_in_degree': round(avg_in_degree, 2),
        'avg_out_degree': round(avg_out_degree, 2),
        'in_degree': [int(x) for x in in_degree],
        'out_degree': [int(x) for x in out_degree],
        'degree_distribution': degree_distribution,
        'hubs': sorted(hubs, key=lambda x: x['score'], reverse=True)[:5],  # Top 5 hubs
        'authorities': sorted(authorities, key=lambda x: x['score'], reverse=True)[:5],  # Top 5 authorities
        'avg_clustering_coefficient': round(avg_clustering, 4),
        'clustering_coefficients': [round(c, 4) for c in clustering_coefficients],
        'strongly_connected_nodes': strongly_connected,
        'isolated_nodes': isolated_nodes,
        'dangling_nodes': dangling_nodes,
        'hub_scores': hub_scores,
        'authority_scores': authority_scores
    }

def calculate_hits_scores(adj_matrix, n, iterations=20):
    """Tính Hub và Authority scores bằng HITS algorithm"""
    # Initialize scores
    hub_scores = np.ones(n)
    authority_scores = np.ones(n)
    
    for _ in range(iterations):
        # Update authority scores: sum of hub scores of incoming links
        new_authority = adj_matrix.T @ hub_scores
        
        # Update hub scores: sum of authority scores of outgoing links
        new_hub = adj_matrix @ authority_scores
        
        # Normalize
        hub_norm = np.linalg.norm(new_hub)
        auth_norm = np.linalg.norm(new_authority)
        
        hub_scores = new_hub / hub_norm if hub_norm > 0 else new_hub
        authority_scores = new_authority / auth_norm if auth_norm > 0 else new_authority
    
    return [round(float(h), 6) for h in hub_scores], [round(float(a), 6) for a in authority_scores]

if __name__ == '__main__':
    app.run(debug=True, port=5001)