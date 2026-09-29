from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader

OUT = Path(r"D:\JOJO Store\output\pdf\Bharat_Sirmal_AI_Developer_Resume_Updated.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)
BLUE = colors.HexColor("#203D66")
WIDTH = A4[0] - 91.4 - 12
body = ParagraphStyle("Body", fontName="Helvetica", fontSize=9.2, leading=12.2, spaceAfter=0)
bullet = ParagraphStyle("Bullet", parent=body, leftIndent=11, firstLineIndent=0, bulletIndent=1.5, spaceAfter=1.2)
title = ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=20, leading=23, alignment=TA_CENTER, textColor=BLUE)
contact = ParagraphStyle("Contact", parent=body, fontSize=8.6, leading=11, alignment=TA_CENTER)
section = ParagraphStyle("Section", fontName="Helvetica-Bold", fontSize=10.5, leading=13, textColor=BLUE, spaceBefore=8, spaceAfter=3)
project_title = ParagraphStyle("Project", parent=body, fontName="Helvetica-Bold")
tech = ParagraphStyle("Tech", parent=body, fontName="Helvetica-Oblique", fontSize=8.8, leading=11.4, alignment=TA_RIGHT)
date = ParagraphStyle("Date", parent=body, alignment=TA_RIGHT)
story = []

def p(text, style=body):
    return Paragraph(text, style)

def heading(text):
    story.extend([p(text, section), HRFlowable(width="100%", thickness=.6, color=BLUE, spaceAfter=4)])

def row(left, right, widths, right_style=tech):
    table = Table([[p(left, project_title), p(right, right_style)]], colWidths=widths, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "BOTTOM"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
    ]))
    return table

def bullets(items):
    return [Paragraph(item, bullet, bulletText="•") for item in items]

def project(name, stack, items):
    story.append(KeepTogether([row(name, stack, [WIDTH*.65, WIDTH*.35]), *bullets(items)]))
    story.append(Spacer(1, 4))

story.extend([
    p("BHARAT SIRMAL", title), Spacer(1, 3),
    p('sirmalbharat99@gmail.com  |  <link href="http://linkedin.com/in/bharat-sirmal" color="#203D66"><u>LinkedIn</u></link>  |  <link href="http://github.com/bharatsirmal008" color="#203D66"><u>GitHub</u></link>  |  <link href="https://bharatsirmal.vercel.app/" color="#203D66"><u>Portfolio</u></link>  |  Navi Mumbai, Maharashtra, India', contact),
])
heading("SUMMARY")
story.append(p("Computer Science student building AI-driven applications and automation tools using Python, RAG, LLM APIs, and full-stack web technologies. Seeking an AI Application Developer internship to re-imagine business workflows with AI and deliver scalable internal tools."))
heading("SKILLS")
for label, content in [
    ("Languages", "Python, JavaScript, TypeScript, C++"),
    ("Web &amp; Frameworks", "HTML, CSS, React, Next.js, Node.js, Express.js, Flask"),
    ("Databases", "MongoDB, MySQL, SQLite, ChromaDB (vector DB)"),
    ("AI &amp; Automation", "LLM APIs (Gemini), RAG, Embeddings (Hugging Face), Prompt Engineering, Python automation"),
    ("APIs &amp; Tools", "REST APIs, Postman, Git, GitHub, Firebase, Cloudinary"),
    ("Data &amp; Dashboards", "Power BI, Excel, Google Sheets"),
    ("Cloud", "Google Cloud, Vercel"),
]:
    story.append(p(f"<b>{label}:</b> {content}"))
heading("PROJECTS")
project("Bharat AI - Personal AI Assistant (RAG Pipeline)", "Python, Flask, ChromaDB,<br/>Next.js", [
    "Built an end-to-end RAG assistant that converts structured JSON data into embeddings (all-MiniLM-L6-v2) stored in ChromaDB for semantic retrieval.",
    "Integrated the Gemini API through a Flask REST API, serving relevant context with similarity filtering to improve answer accuracy.",
    "Delivered streaming responses and voice interaction (speech-to-text, text-to-speech) via a Next.js / React / TypeScript frontend.",
])
project("YAOP Community Platform", "Next.js, Express.js, MongoDB,<br/>Firebase", [
    "Developed a full-stack platform to manage events, volunteers, and donations on a centralized MongoDB database.",
    "Implemented Firebase authentication and validation workflows to keep donation records accurate and consistent.",
    "Built an admin dashboard that streamlined data entry and record updates, reducing manual effort by ~40%.",
])
project("JOJO Store - Full-Stack E-Commerce Platform", "Next.js, TypeScript, Firebase,<br/>Stripe, Cloudinary, Tailwind CSS", [
    "Built a full-stack e-commerce storefront and admin dashboard with product search, cart, checkout, inventory, and order management.",
    "Integrated Firebase authentication and Firestore data workflows, Stripe payments, and Cloudinary product image uploads.",
    "Designed responsive, animated interfaces with Framer Motion, keyboard-accessible dialogs, and reduced-motion support; added UI interaction tests with Vitest and React Testing Library.",
])
heading("INTERNSHIP")
story.append(row("Web Development Intern - <font name='Helvetica'>InAmigos Foundation</font>", "May 2026 - Jun 2026", [WIDTH*.75, WIDTH*.25], date))
story.extend(bullets([
    "Developed and maintained website features using React, Node.js, and MongoDB.",
    "Built and redesigned page layouts with HTML, CSS, and JavaScript, improving usability and maintainability.",
    "Collaborated with the team to deliver updates on schedule.",
]))
heading("EDUCATION")
story.append(row("B.Tech in Computer Science - <font name='Helvetica'>Pillai College of Engineering, Panvel</font>", "2023 - 2027", [WIDTH*.83, WIDTH*.17], date))
story.append(p("CGPA: 8.74 / 10.0  |  Coursework: DBMS, Data Structures, AI/ML, Web Development"))
heading("CERTIFICATIONS")
story.extend(bullets([
    "<b>Google Cloud Data Analytics Certificate</b> - cloud-based data pipelines, analysis, and structured reporting.",
    "<b>Google Cloud Career Launchpad (Foundations Track)</b> - cloud computing fundamentals, data management, analytics.",
    "<b>Microsoft Power BI - The Complete Guide</b> (Infosys Springboard).",
]))
doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=45.7, rightMargin=45.7, topMargin=36, bottomMargin=35,
                        title="Bharat Sirmal - AI Application Developer Resume", author="Bharat Sirmal")
doc.build(story)
r = PdfReader(str(OUT))
assert len(r.pages) == 1, f"Expected one page, got {len(r.pages)}"
text = r.pages[0].extract_text()
for expected in ["JOJO Store", "YAOP Community Platform", "Bharat AI", "8.74", "~40%", "sirmalbharat99@gmail.com", "CERTIFICATIONS"]:
    assert expected in text, expected
links = [a.get_object()["/A"]["/URI"] for a in r.pages[0].get("/Annots", [])]
assert len(links) == 3, links
assert "\ufffd" not in text
print("Saved:", OUT)
print("Pages:", len(r.pages), "| Profile links:", links)
print(text)
