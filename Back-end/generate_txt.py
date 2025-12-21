import os

def create_valid_txt(filename):
    content = """Introduction to Plagiarism Detection
    
    Plagiarism is the representation of another author's language, thoughts, ideas, or expressions as one's own original work. In educational contexts, there are differing definitions of plagiarism depending on the institution. Plagiarism is considered a violation of academic integrity and a breach of journalistic ethics. It is subject to sanctions such as penalties, suspension, expulsion from school or work, substantial fines and even imprisonment.
    
    Modern plagiarism detection software uses advanced algorithms to compare submitted documents against vast databases of academic papers, websites, and improved capabilities to detect AI-generated text.
    
    This is a dummy text file created to test the dynamic statistics calculation of the Plagiarism Dashboard. It contains multiple paragraphs, sentences, and words to verify that the backend correctly counts them.
    
    Conclusion
    
    In conclusion, accurate detection is crucial for maintaining academic standards."""
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filename}")

if __name__ == "__main__":
    path = os.path.join(os.getcwd(), 'app', 'uploads', 'rapport_demo.txt')
    create_valid_txt(path)
