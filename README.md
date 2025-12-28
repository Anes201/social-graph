# PRIG - Personal Relationship Intelligence Graph

A local-first graph database + visual layer that turns your contacts into assets, scored, connected, and queryable for business leverage.

## Features

- **Graph Visualization**: Interactive force-directed graph with Sigma.js
- **Leverage Scoring**: 6-component scoring system (Capital Access, Skill Value, Network Reach, Reliability, Speed, Alignment)
- **Relationship Management**: Track relationships with strength, type, and context tags
- **High-ROI Queries**: 
  - Top underutilized connections
  - Shortest path to industry
  - Connectors to investors
  - Fast validators
  - Weak ties with high upside
- **CSV Import**: Bulk import contacts from CSV files
- **Auto-suggestions**: People to reconnect with based on leverage and time
- **Notes & Timeline**: Track interactions and update relationship strength

## Tech Stack

- **Frontend**: React + Vite
- **Graph Engine**: graphology + sigma.js
- **Storage**: IndexedDB via Dexie.js (local-first)
- **Styling**: Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically http://localhost:5173)

## Usage

### Adding People

Click "Add Person" to create a new node. Fill in:
- Basic info (name, email, phone, location)
- Social links (LinkedIn, X, Instagram, WhatsApp)
- Occupation (role, company, industry)
- Skills (with weights)
- Leverage scores (6 sliders, 0-10 each)

### Creating Relationships

Select a node, then click "+ Add" in the Relationships section. Choose:
- Target node
- Relationship type (friend, business, family, intro, online-only)
- Strength (1-10)
- Context tags (e.g., ecom, dev, money, logistics)

### Running Queries

Use the left sidebar to run pre-built queries:
- **Top 5 Underutilized**: High leverage, low recent interaction
- **People to Reconnect With**: High leverage, >3 months since interaction
- **Connectors to Investors**: People who know investors but aren't investors
- **Fast Validators**: High speed + alignment, available within 48h
- **Weak Ties, High Upside**: Low relationship strength but high leverage potential
- **Shortest Path to Industry**: Find the shortest connection path to a specific industry

### Importing CSV

Click "Import CSV" and paste CSV data with headers. The system will:
- Auto-detect column mapping
- Auto-tag industries from job titles
- Bulk create nodes

Expected CSV format:
```
name,email,phone,role,company,location,linkedin
John Doe,john@example.com,123-456-7890,Developer,Tech Corp,San Francisco,linkedin.com/in/johndoe
```

### Notes & Timeline

Select a node and add notes with dates. The `lastInteraction` field is automatically updated when you add a note.

## Data Storage

All data is stored locally in your browser's IndexedDB. No data is sent to any server. Your graph is private and stays on your device.

## License

MIT
