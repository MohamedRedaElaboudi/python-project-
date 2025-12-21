from reportlab.pdfgen import canvas
import os

def create_valid_pdf(filename):
    c = canvas.Canvas(filename)
    text = c.beginText(40, 750)
    text.setFont("Helvetica", 12)
    
    content = """
    Introduction to Plagiarism Detection
    
    Plagiarism is the representation of another author's language, thoughts, ideas, or expressions as one's own original work. In educational contexts, there are differing definitions of plagiarism depending on the institution. Plagiarism is considered a violation of academic integrity and a breach of journalistic ethics. It is subject to sanctions such as penalties, suspension, expulsion from school or work, substantial fines and even imprisonment.
    
    Modern plagiarism detection software uses advanced algorithms to compare submitted documents against vast databases of academic papers, websites, and improved capabilities to detect AI-generated text.
    
    This is a dummy PDF created to test the dynamic statistics calculation of the Plagiarism Dashboard. It contains multiple paragraphs, sentences, and words to verify that the backend correctly counts them.
    
    Conclusion
    
    In conclusion, accurate detection is crucial for maintaining academic standards.
    """
    
    for line in content.split('\n'):
        text.textLine(line.strip())
        
    c.drawText(text)
    c.save()
    print(f"Created {filename}")

if __name__ == "__main__":
    path = os.path.join(os.getcwd(), 'uploads', 'rapport_demo.pdf')
    create_valid_pdf(path)
