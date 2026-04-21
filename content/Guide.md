# Quick Guide

## Run Local HTTP Server

From the project root (satyam-thakur), run:

python -m http.server 8000 --bind 127.0.0.1

Then open:

http://127.0.0.1:8000

## Generate Articles Index (Windows)

Run this command in PowerShell:

Set-Location 'C:\Users\SATYAM\Documents\ACareer\I_Portfolio\satyam-thakur'; & .\.venv\Lib\site-packages\nodejs\node.exe .\tools\generate-articles-index.js

## Add New Article

1. Create a new markdown file in content/articles using the date prefix format.
2. Add front matter: title, date, lastmod, author, description, tags, categories, draft, toc.
3. Write the article content.
4. Run the Generate Articles Index command above.
5. Start the local HTTP server and verify the article page and listing.
