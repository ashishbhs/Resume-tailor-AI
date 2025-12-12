# ResumeTailor AI

An intelligent resume optimization tool powered by the Google Gemini API. This application parses your resume, scores it against a specific job description, and provides actionable, ATS-friendly tailoring suggestions to help you land your dream job.

## Features

*   **Resume Parsing**: Instantly extracts text from PDF, DOCX, and TXT files.
*   **Smart Analysis**: Scores your resume against Job Descriptions (JD) or performs a general best-practice audit.
*   **ATS Scoring**: Calculates a strict match score based on keywords, clarity, and relevance.
*   **Auto-Optimization**: Uses GenAI to rewrite bullet points and insert missing keywords automatically.
*   **Gap Analysis & Study Plan**: Generates a custom study plan for skills added by the AI to ensure you are interview-ready.
*   **Live Editor**: Polish the optimized resume with a built-in Markdown editor.
*   **Theme Support**: Beautiful UI with toggleable Dark and Light modes.

## Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5 Flash (`@google/genai` SDK)
*   **Styling**: Custom CSS animations and Tailwind utility classes

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/resume-tailor-ai.git
    cd resume-tailor-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Ensure you have a valid Google Gemini API Key available in `process.env.API_KEY`.

4.  **Run the application**
    ```bash
    npm run dev
    ```

## Usage

1.  **Upload**: Drag and drop your resume file.
2.  **Context**: Paste the target Job Description.
3.  **Analyze**: Get an instant score and detailed breakdown of strengths and weaknesses.
4.  **Optimize**: Click "Auto-Optimize" to let AI fix gaps, then review the "Study Plan" tab to prepare for your interview.
