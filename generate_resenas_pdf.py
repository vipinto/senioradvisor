import markdown2
from weasyprint import HTML, CSS

# Read markdown file
with open('/app/SISTEMA_RESENAS.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to HTML
html_content = markdown2.markdown(md_content, extras=['tables', 'fenced-code-blocks'])

# Create full HTML with styling
full_html = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: A4;
            margin: 2cm;
        }}
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }}
        h1 {{
            color: #E6202E;
            font-size: 22pt;
            border-bottom: 3px solid #E6202E;
            padding-bottom: 10px;
            margin-top: 20px;
        }}
        h2 {{
            color: #E6202E;
            font-size: 14pt;
            margin-top: 20px;
            border-left: 4px solid #E6202E;
            padding-left: 10px;
        }}
        h3 {{
            color: #444;
            font-size: 12pt;
            margin-top: 15px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
        }}
        th {{
            background-color: #E6202E;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }}
        td {{
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        code {{
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9pt;
            font-family: 'Courier New', monospace;
        }}
        pre {{
            background-color: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 8px;
            font-size: 9pt;
            overflow-x: auto;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
        }}
        pre code {{
            background-color: transparent;
            color: #f8f8f2;
        }}
        hr {{
            border: none;
            border-top: 2px solid #E6202E;
            margin: 25px 0;
        }}
        strong {{
            color: #E6202E;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #E6202E 0%, #ff6b6b 100%);
            color: white;
            border-radius: 10px;
        }}
        .logo {{
            font-size: 28pt;
            font-weight: bold;
        }}
        blockquote {{
            border-left: 4px solid #E6202E;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #fff5f5;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">U-CAN</div>
        <p style="margin: 5px 0 0 0; font-size: 12pt;">Sistema de Reseñas Bidireccional</p>
    </div>
    {html_content}
</body>
</html>
'''

# Generate PDF
HTML(string=full_html).write_pdf('/app/SISTEMA_RESENAS.pdf')
print("PDF generado: /app/SISTEMA_RESENAS.pdf")
