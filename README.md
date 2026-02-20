# LexConnect

This is a Next.js application for LexConnect, a platform connecting clients with lawyers. The project is built with Next.js, TypeScript, Tailwind CSS, ShadCN UI components, and Firebase.

## Getting Started

To get started with the project, take a look at `src/app/page.tsx`. This is the main landing page. The application features different dashboards for clients, lawyers, and administrators, with logic handled in `src/app/dashboard/layout.tsx`.

## Local Development Setup

To run this project on your local machine using VS Code or another editor, follow these steps.

### 1. Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or later is recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 2. Install Dependencies

After downloading or cloning the project, navigate to the project's root directory in your terminal and run the following command to install all the necessary packages:

```bash
npm install
```

### 3. Set Up Environment Variables

The project requires Firebase configuration to connect to the backend services.

1.  Create a new file named `.env.local` in the root of your project directory.
2.  Copy the contents from the `.env` file into your new `.env.local` file.
3.  **Important**: You will need to obtain your own Firebase project configuration and populate the `.env.local` file with your actual Firebase credentials. The `firebaseConfig` object in `src/firebase/config.ts` relies on these variables.

Your `.env.local` file should look something like this, but with **your own project's keys**:

```
# Firebase SDK configuration
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
```

_Note: The project is configured to use these environment variables in `src/firebase/config.ts`._

### 4. Run the Development Server

Once the dependencies are installed and the environment variables are set up, you can start the development server by running:

```bash
npm run dev
```

This will start the application on `http://localhost:9002` (as configured in `package.json`). You can now open this URL in your web browser to see the application running.
