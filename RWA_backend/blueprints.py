from flask import Blueprint, jsonify, request
from model.data_processor_class import DataProcessor
from utilities.utils import detect_text_diff
from summarize import Summarizer
import requests
from bs4 import BeautifulSoup
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

main_blueprint = Blueprint('main', __name__)

summarizer = Summarizer()

# DataProcessor instance
data_processor = DataProcessor("humarin/chatgpt_paraphraser_on_T5_base", 0.1, 64)

@main_blueprint.route('/paraphrase', methods=['POST'])
def handle_post():
    data = request.json.get('data')
    print(data)
    if not data:
        return jsonify({"error": "No data provided."})
    processed_data = data_processor.process_data(data['text'])
    changes = detect_text_diff(data['text'], processed_data)
    print(processed_data)
    return jsonify({
        "original": data['text'],
        "processedData": processed_data,
        "pos": list(changes.keys()),
        'error_words': list(changes.values())
    })

@main_blueprint.route('/summarize', methods=['POST'])
def handle_sum():
    data = request.json.get('data')
    print(data)
    if not data:
        return jsonify({"error": "No data provided."})
    summary = summarizer.get_summary(data['text'])
    print(summary)
    return jsonify({"summary": summary})

# Web scraping function
def scrape_website_content(url):
    response = requests.get(url)
    if response.status_code != 200:
        return None, "Error: Unable to fetch the webpage."
    soup = BeautifulSoup(response.content, 'html.parser')
    content_tags = soup.find_all('p')
    article_content = ' '.join([tag.get_text() for tag in content_tags])
    print(article_content)

    return article_content

@main_blueprint.route('/scrape_and_paraphrase', methods=['POST'])
def scrape_and_paraphrase():
    url = request.json.get('url')
    content = scrape_website_content(url)
    if not content:
        return jsonify({"error": "Unable to fetch or process the article."})
    processed_data = data_processor.process_data(content)
    print(processed_data)
    return jsonify({"processedData": processed_data})

@main_blueprint.route('/scrape_and_summary', methods=['POST'])
def scrape_and_summary():
    url = request.json.get('url')
    content = scrape_website_content(url)
    if not content:
        return jsonify({"error": "Unable to fetch or process the article."})
    summary = summarizer.get_summary(content)
    print(summary)
    return jsonify({"processedSummary": summary})