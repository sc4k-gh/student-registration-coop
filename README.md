# Student Registration App

A simple mobile application for managing student registrations, teachers, and courses.

## Prerequisites

Before running the project, make sure you have the following installed:

1.  **Node.js**: [Download here](https://nodejs.org/)
2.  **Expo Go App**: Install on your iOS or Android device from the App Store or Google Play Store.

## Project Structure

-   `client/`: Contains the React Native (Expo) frontend code.
-   `database/`: Contains the SQL schema (`schema.sql`) for the database.

## How to Run

1.  **Navigate to the client directory**:
    ```bash
    cd client
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the app**:
    ```bash
    npx expo start
    ```

4.  **Open on Device**:
    -   Scan the QR code printed in the terminal with the **Expo Go** app (Android) or Camera app (iOS).
    -   Or press `a` to run on Android Emulator / `i` to run on iOS Simulator (if set up).

## Features (POC)

-   **Dashboard**: View summary statistics.
-   **Sidebar Navigation**: Access Dashboard, Students, Teachers, and Settings.
-   **Placeholder Pages**: Basic screens for Students, Teachers, and Settings.