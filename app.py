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
    """Tính PageRank từ ma trận kề"""
    n = len(urls)
    
    # Kiểm tra nếu không có cạnh nào
    if sum(sum(row) for row in adjacency_matrix) == 0:
        logger.warning("No edges found between the provided URLs. Assigning equal ranks.")
        return [(url, 1.0/n) for url in urls]
    
    # Chuyển ma trận kề thành ma trận chuyển tiếp
    transition_matrix = []
    for i in range(n):
        row_sum = sum(adjacency_matrix[i])
        if row_sum == 0:
            # Dangling node: phân phối đều cho tất cả các node
            transition_matrix.append([1.0/n] * n)
            logger.info(f"Dangling node {urls[i]}: distributing rank evenly")
        else:
            # Node bình thường: phân phối theo tỷ lệ
            transition_matrix.append([adjacency_matrix[i][j] / row_sum for j in range(n)])
    
    # Khởi tạo PageRank
    pagerank = [1.0/n] * n
    
    # Lặp PageRank
    for iteration in range(max_iterations):
        new_pagerank = [0] * n
        
        # Tính PageRank mới
        for i in range(n):
            # Đóng góp từ các node khác
            for j in range(n):
                new_pagerank[i] += transition_matrix[j][i] * pagerank[j]
            
            # Áp dụng damping factor
            new_pagerank[i] = (1 - damping_factor) / n + damping_factor * new_pagerank[i]
        
        # Kiểm tra hội tụ
        diff = sum(abs(new_pagerank[i] - pagerank[i]) for i in range(n))
        if diff < tolerance:
            logger.info(f"PageRank converged after {iteration + 1} iterations")
            break
        
        pagerank = new_pagerank
    
    # Sắp xếp kết quả
    results = [(urls[i], pagerank[i]) for i in range(n)]
    results.sort(key=lambda x: x[1], reverse=True)
    
    logger.info(f"PageRank calculation completed. Results: {results}")
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
        
        results = calculate_pagerank(unique_urls, damping_factor, max_iterations)
        
        return jsonify({
            'results': [{'url': url, 'rank': float(rank)} for url, rank in results],
            'total_urls': len(unique_urls),
            'damping_factor': damping_factor,
            'max_iterations': max_iterations
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
        
        return jsonify({
            'results': [{'url': url, 'rank': float(rank)} for url, rank in results],
            'total_urls': len(urls),
            'damping_factor': damping_factor,
            'max_iterations': max_iterations
        })
        
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)