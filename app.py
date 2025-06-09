from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import numpy as np
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import logging

app = Flask(__name__)
CORS(app)

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def extract_links(url):
    if not is_valid_url(url):
        logger.warning(f"Invalid URL: {url}")
        return []
        
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise exception for bad status codes
        
        soup = BeautifulSoup(response.text, 'html.parser')
        links = []
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and href.startswith('http'):
                links.append(href)
        return links
    except requests.exceptions.Timeout:
        logger.error(f"Timeout while fetching {url}")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching {url}: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error while processing {url}: {str(e)}")
        return []

def calculate_pagerank(urls, max_iterations=100, damping_factor=0.85):
    # Validate input
    if not urls:
        raise ValueError("No URLs provided")
        
    # Create directed graph
    G = nx.DiGraph()
    
    # Add nodes
    for url in urls:
        G.add_node(url)
    
    # Add edges by crawling links
    for url in urls:
        links = extract_links(url)
        for link in links:
            if link in urls:  # Only add edges to URLs in our set
                G.add_edge(url, link)
    
    # Check if graph is empty
    if not G.edges():
        # If no edges, assign equal ranks to all nodes
        return [(url, 1.0/len(urls)) for url in urls]
    
    try:
        # Calculate PageRank
        pagerank = nx.pagerank(G, alpha=damping_factor, max_iter=max_iterations)
        
        # Sort results
        sorted_ranks = sorted(pagerank.items(), key=lambda x: x[1], reverse=True)
        
        print(sorted_ranks)
        
        return sorted_ranks
    except Exception as e:
        logger.error(f"Error calculating PageRank: {str(e)}")
        # Return equal ranks as fallback
        return [(url, 1.0/len(urls)) for url in urls]

@app.route('/api/pagerank', methods=['POST'])
def pagerank():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        urls = data.get('urls', [])
        if not urls:
            return jsonify({'error': 'No URLs provided'}), 400
            
        # Validate URLs
        valid_urls = [url for url in urls if is_valid_url(url)]
        if not valid_urls:
            return jsonify({'error': 'No valid URLs provided'}), 400
            
        results = calculate_pagerank(valid_urls)
        return jsonify({
            'results': [{'url': url, 'rank': float(rank)} for url, rank in results]
        })
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True) 