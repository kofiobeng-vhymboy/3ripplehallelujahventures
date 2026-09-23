# 3ripple Hallelujah Ventures - Web Application

This is a polished, full-stack React application built with Vite, Tailwind CSS, and Express.

## Local Setup & Development

To run this application on your local machine (e.g., using VS Code), follow these steps:

### 1. Prerequisites
- **Node.js**: Install the latest LTS version from [nodejs.org](https://nodejs.org/).
- **VS Code**: Recommended editor for development.

### 2. Installation
1. **Extract the ZIP**: Unzip the downloaded file into a folder.
2. **Open in VS Code**: Open VS Code and then open the extracted folder (`File > Open Folder...`).
3. **Open Terminal**: Go to `Terminal > New Terminal`.
4. **Install Dependencies**: Run the following command:
   ```bash
   npm install
   ```

### 3. Running the App
Start the development server:
```bash
npm run dev
```

The application will be running at `http://localhost:3000`.

### 4. Project Structure
- `src/App.tsx`: Main entry point for the frontend UI.
- `server.ts`: Express backend serving the product API and handling the development environment.
- `src/components/`: Reusable UI components (Navbar, Cart, Product Cards, etc.).
- `src/types.ts`: TypeScript interfaces for the data models.

## Key Features
- **Shopping Cart**: Real-time cart management with local state.
- **WhatsApp Checkout**: Integrated checkout that sends order details directly to the merchant via WhatsApp.
- **User Authentication (Simulation)**: Login and Signup flows with persistent profile views.
- **Mobile Optimized**: Fully responsive navigation with a specialized mobile drawer.
- **Product Filtering**: Search and filter mixes by grain type.

## VS Code Recommended Extensions
- **ESLint**: For code quality checks.
- **Tailwind CSS IntelliSense**: For better styling experience.
- **Prettier**: For consistent code formatting.

## Notes on WhatsApp Integration
The checkout sends messages to a number using a whatsapp api. You can update this number in `src/components/CartDrawer.tsx` if needed.
