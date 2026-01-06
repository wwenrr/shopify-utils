# Shopify Utils

A comprehensive collection of utilities and tools designed to streamline content creation and HTML manipulation for Shopify blog posts and pages.

## Overview

Shopify Utils is a React-based web application that provides various generators and editors to help create standardized, properly formatted HTML content for Shopify stores. The application includes tools for generating author sections, blog buttons, FAQs, and an advanced HTML editor with block-based content management.

## Features

### 1. Author Generator
Generate properly formatted HTML templates for author sections in blog posts. Input author information and get clean, inline-styled HTML ready to be embedded in your Shopify content.

### 2. Blog Button Generator
Create customized blog buttons with various styling options. Configure button text, links, colors, and variants to match your brand guidelines.

### 3. FAQs Generator
Transform raw HTML content into structured FAQ sections. Parse existing HTML with headings and paragraphs, and convert them into properly formatted FAQ blocks with inline styles.

### 4. HTML Alignment Tool
Validate and reformat HTML content by visualizing the structure as a tree. Analyze tag hierarchy and apply alignment formatting to selected elements.

### 5. Blog Editor
A powerful block-based HTML editor that allows you to:
- Parse HTML into manageable blocks
- Insert, edit, and delete content blocks
- Group related blocks together
- Copy individual blocks or entire sections
- Drag and select multiple blocks
- Manage H2-grouped content sections

### 6. Dashboard
View project statistics, commit history, and development activity with visual charts and tables.

### 7. Token Configuration
Configure GitHub personal access tokens for integration features, manage gists, and control authentication settings.

## Installation

### Prerequisites
- Node.js (version 16 or higher recommended)
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/wwenrr/shopify-utils.git
cd shopify-utils
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`
Runs the app in development mode. The page will automatically reload when you make changes. You may also see lint errors in the console.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. The build is optimized for best performance, with minified files and hashed filenames.

### `npm run generate:feature-stats`
Generates feature statistics data for the dashboard.

## Project Structure

```
shopify-utils/
├── public/              # Static files
├── src/
│   ├── features/        # Feature modules
│   │   ├── author-generator/
│   │   ├── blog-button/
│   │   └── faqs-generator/
│   ├── pages/           # Page components
│   │   ├── overview/    # Dashboard
│   │   ├── generators/  # Generator pages
│   │   ├── editor/      # Blog editor
│   │   └── config/      # Configuration pages
│   ├── layouts/         # Layout components
│   ├── routes/          # Route definitions
│   ├── shared/          # Shared components and utilities
│   └── constants/       # Constants and configuration
├── scripts/             # Build and utility scripts
└── package.json
```

## Technologies Used

- React 18
- React Router v6
- Zustand (state management)
- Recharts (data visualization)
- React Toastify (notifications)
- Tippy.js (tooltips)
- Radix UI (dropdown menus)
- CRACO (Create React App Configuration Override)

## Usage

### Generating Content

1. Navigate to the desired generator from the sidebar menu
2. Fill in the required information in the form
3. Preview the generated HTML in real-time
4. Click the "Copy" button to copy the HTML to your clipboard
5. Paste the HTML into your Shopify blog post or page

### Using the Blog Editor

1. Navigate to the Editor page
2. Paste your HTML content into the input area
3. Click "Parse HTML" to convert content into editable blocks
4. Use the toolbar to insert, edit, or delete blocks
5. Select multiple blocks by dragging or clicking with Shift/Ctrl
6. Group related blocks for easier management
7. Copy the final HTML when ready

### Configuring GitHub Integration

1. Navigate to Config > Tokens
2. Enter your GitHub personal access token
3. Save the configuration
4. Use the gist management features to save and load configurations

## Deployment

This application is configured to be deployed on GitHub Pages. The homepage is set to: `https://wwenrr.github.io/shopify-utils`

To deploy:
```bash
npm run build
```

The build artifacts will be generated in the `build` folder, ready for deployment.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is private and not licensed for public use.

## Support

For questions or support, please open an issue in the GitHub repository.
