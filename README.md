# VeriSure: AI-Powered Document Verification

VeriSure is a web application designed to streamline the document verification process for university admissions. It uses AI to analyze uploaded documents—such as marksheets, certificates, and ID cards—to verify their authenticity and extract relevant information.

## Tech Stack

This project is built with a modern, production-ready tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

To get the project up and running on your local machine, follow these steps:

1.  **Install Dependencies**:
    Open your terminal, navigate to the project directory, and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    After the installation is complete, start the development server:
    ```bash
    npm run dev
    ```

3.  **Open the App**:
    Open your browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application in action.

## Features

- **User Authentication**: A complete login and profile creation flow.
- **Document Upload**: Users can upload various document types, including images (JPG, PNG, WebP).
- **AI Verification**: Uploaded documents are analyzed by an AI model to check for required elements and determine a verification status (`verified`, `rejected`, or `requires_manual_review`).
- **Dynamic Dashboard**: A central dashboard to view all uploaded documents, their status, and the results of the AI analysis.
- **Responsive Design**: A modern, responsive interface that works on both desktop and mobile devices.
- **Light & Dark Mode**: A theme toggle to switch between light and dark modes.