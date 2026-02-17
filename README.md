# Student Registration App

A robust mobile application for managing student registrations, teachers, and courses, built with React Native (Expo).

## Project Overview

This application serves as a Proof of Concept (POC) for a student management system. It allows administrators to:
- View key metrics via a Dashboard.
- Manage Students (List, Add, Edit).
- Manage Teachers.
- Configure Application Settings.

## Project Structure

The project follows a scalable, industry-standard directory structure:

```
client/
  ├── src/
  │   ├── assets/         # Static assets (images, fonts)
  │   ├── components/     # Reusable UI components (Buttons, Cards)
  │   ├── navigation/     # Navigation configuration (Stack/Drawer)
  │   ├── screens/        # Screen-level components (Dashboard, etc.)
  │   ├── services/       # API services and data fetching logic
  │   ├── styles/         # Global styles and theme constants
  │   ├── utils/          # Helper functions and utilities
  │   └── App.js          # Application entry point
  ├── package.json        # Dependencies and scripts imports
  └── ...
database/
  └── schema.sql          # PostgreSQL database schema
```

### Key Files
- **`client/src/App.js`**: The main entry point that sets up the `SafeAreaProvider` and renders the main navigator.
- **`client/src/navigation/AppNavigator.js`**: Handles the app's navigation logic, combining Stack and Drawer navigators.
- **`client/src/styles/theme.js`**: Defines the application's color palette and typography for consistent styling.

## Prerequisites

Before running the project, ensure you have the following installed:

1.  **Node.js** (LTS version recommended): [Download here](https://nodejs.org/)
2.  **Expo Go**: Install the Expo Go app on your iOS or Android device.
    -   [iOS App Store](https://apps.apple.com/us/app/expo-go/id982107779)
    -   [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Installation & Setup

1.  **Navigate to the client directory**:
    ```bash
    cd client
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the development server**:
    ```bash
    npx expo start
    ```

2.  **Open the App**:
    -   **On Physical Device**: Scan the QR code displayed in the terminal using the Expo Go app (Android) or the Camera app (iOS).
    -   **On Emulator/Simulator**: Press `a` (Android) or `i` (iOS) in the terminal window to launch on a connected emulator or simulator.

## Testing

To verify the installation and code changes:
1.  Run the application using `npx expo start`.
2.  Navigate through the app:
    -   **Landing Page**: Should appear first. Click "Get Started" (or equivalent) to enter.
    -   **Dashboard**: Check if the sidebar (drawer) opens.
    -   **Screens**: Visit "Students", "Teachers", and "Settings" via the drawer to ensure all routes are working.