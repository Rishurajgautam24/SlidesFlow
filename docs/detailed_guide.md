# SlideFlow Detailed Guide

## What the App Is

SlideFlow is a dynamic and interactive presentation application designed to enhance the delivery and management of digital presentations. Built with a focus on user experience and versatility, SlideFlow transforms static PDF documents into engaging, interactive slides. Its core purpose is to provide presenters with a comprehensive tool that goes beyond simple slide viewing, offering features for navigation, annotation, time management, and even on-the-fly interactive content creation.

SlideFlow's core features include:

*   **PDF Slide Display:** Seamlessly display uploaded PDF documents, presenting each page as an individual, navigable slide.
*   **Keyboard Navigation:** Effortlessly move through your presentation using intuitive keyboard shortcuts, including arrow keys and the spacebar.
*   **Annotation Tools:** Enhance your slides during the presentation with a suite of annotation tools, such as a pen, highlighter, and basic shapes. Annotations are intelligently stored on a separate layer, preserving the original document.
*   **Laser Pointer/Spotlight:** Direct audience attention to key areas on your slides with a virtual laser pointer or spotlight effect.
*   **Timer & Clock:** Keep track of your presentation time with an integrated timer and clock display, helping you stay on schedule.
*   **Interactive Whiteboard:** Generate blank slides on demand, providing a dynamic whiteboard space for spontaneous discussions, brainstorming, or detailed explanations during your presentation.
*   **PPT to PDF Conversion Tool:** Simplify your workflow with a built-in tool that converts uploaded PowerPoint (PPT) files into PDF format, ready for use within SlideFlow.

With its vivid blue primary color, light gray background, and complementary purple accents, SlideFlow offers a professional and visually appealing interface. The use of the 'Inter' font provides a modern and clean aesthetic, while clean, minimalist icons ensure intuitive navigation and tool selection. The split-screen layout with a sidebar for slide previews further enhances usability and navigation.

## How to Use It Locally

To set up and run the SlideFlow application on your local machine, follow these steps:

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js:** SlideFlow requires Node.js to run. You can download the latest version from the official [Node.js website](https://nodejs.org/).
*   **npm:** npm (Node Package Manager) is installed automatically with Node.js. It is used to manage the project's dependencies.

### Setting Up the Project

1.  **Clone the Repository:** Obtain the project files by cloning the SlideFlow repository from its source. Open your terminal or command prompt and run:

    
```
bash
    git clone [repository_url]
    cd [repository_directory]
    
```
Replace `[repository_url]` with the actual URL of the SlideFlow repository and `[repository_directory]` with the name of the cloned directory.

2.  **Install Dependencies:** Navigate into the project directory in your terminal. Install all the necessary project dependencies by running the following command:
```
bash
    npm install
    
```
This command reads the `package.json` file and downloads all the required packages listed under `dependencies` and `devDependencies`.

### Running the Application

SlideFlow utilizes a Next.js frontend and a Genkit backend for AI functionalities. You will need to start both concurrently.

1.  **Start the Development Server:** In your terminal, from the project root directory, run the following command to start the Next.js development server:
```
bash
    npm run dev
    
```
This will typically start the application on `http://localhost:9002`.

2.  **Start the Genkit Development Environment:** In a **separate** terminal window, navigate to the project root directory. Run the following command to start the Genkit development environment:
```
bash
    npm run genkit:dev
    
```
This will start the Genkit studio, usually accessible at `http://localhost:4000`.

Once both processes are running, you can access the SlideFlow application in your web browser at the address provided by the `npm run dev` command (usually `http://localhost:9002`).

## What Needs to Be Installed

To run SlideFlow locally, you need to have the following installed:

*   **Node.js and npm:** These are fundamental requirements for running the JavaScript-based application and managing its packages.
*   **Project Dependencies:** All the libraries and frameworks the project relies on, as listed in the `package.json` file. These are installed using the command:
```
bash
    npm install
    
```
This command will install packages such as `next`, `react`, `react-dom`, `@genkit-ai/googleai`, `@genkit-ai/next`, `pdfjs-dist`, and many others that provide the core functionality, UI components, and AI integration for SlideFlow.

By following these steps, you should be able to successfully set up and run the SlideFlow application on your local machine and explore its features.