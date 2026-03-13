import markdown2
from weasyprint import HTML, CSS
import os

# Read markdown file
with open('/app/PRESENTACION_UCAN.md', 'r', encoding='utf-8') as f:
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
            font-size: 24pt;
            border-bottom: 3px solid #E6202E;
            padding-bottom: 10px;
            margin-top: 30px;
        }}
        h2 {{
            color: #E6202E;
            font-size: 16pt;
            margin-top: 25px;
            border-left: 4px solid #E6202E;
            padding-left: 10px;
        }}
        h3 {{
            color: #444;
            font-size: 13pt;
            margin-top: 20px;
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
            font-size: 10pt;
        }}
        hr {{
            border: none;
            border-top: 2px solid #E6202E;
            margin: 30px 0;
        }}
        strong {{
            color: #E6202E;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .logo {{
            font-size: 36pt;
            color: #E6202E;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">U-CAN</div>
        <p style="font-size: 14pt; color: #666;">Plataforma de Cuidadores de Mascotas</p>
    </div>
    {html_content}
</body>
</html>
'''

# Generate PDF
HTML(string=full_html).write_pdf('/app/PRESENTACION_UCAN.pdf')
print("PDF generado exitosamente: /app/PRESENTACION_UCAN.pdf")
