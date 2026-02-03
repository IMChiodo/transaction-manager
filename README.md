# Transaction Manager

A full-stack transaction management application built with **SvelteKit 5** and **NestJS**, featuring smart auto-categorization, CSV import/export, bulk operations, and a responsive dark/light theme UI.

## Quick Start

### Prerequisites
- Node.js 18+

### 1. Install Dependencies

```bash
# Clone the repo
git clone git@github.com:IMChiodo/transaction-manager.git
cd transaction-manager

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Run the Application

Open two terminals:

**Terminal 1 - Backend (port 3000):**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

### 3. Open the App

Visit [http://localhost:5173](http://localhost:5173)

## Features

### Core Requirements
- **Transaction Display**: Sortable table (date, amount, category, description) with pagination
- **Filtering**: By date range, category, and search text
- **Manual Categorization**: Dropdown selectors for each transaction
- **Bulk Categorization**: Select multiple transactions and apply categories

### Smart Categorization
- **Auto-suggestions**: Backend suggests categories based on description patterns (e.g., "STARBUCKS" → "Coffee")
- **Accept/Reject**: Icon buttons with tooltips to accept or reject suggestions
- **Accept All**: Bulk accept all pending suggestions with confirmation modal
- **Smart Categorize**: Groups similar uncategorized transactions by merchant for bulk assignment

### Analytics
- **Summary Statistics**: Total spent, income, net, average transaction, categorized/pending counts
- **Visual Breakdown**: Stacked bar chart + color-coded category cards with percentages
- **Category Modal**: "View all" button opens scrollable modal with complete category list

### Additional Features
- **CSV Import**: Upload transactions with duplicate detection
- **CSV Export**: Download filtered transactions as CSV
- **Dark/Light Theme**: Toggle with persistent preference
- **Responsive Design**: Mobile cards / Desktop table

## Testing CSV Import

A `test.csv` file is included in the frontend folder:

1. Click "Import" in the header
2. Select `frontend/test.csv`
3. Preview and confirm import
4. 2 transactions have no category - use Smart Categorize to test bulk categorization

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SvelteKit 2.x, Svelte 5, TypeScript, Tailwind CSS 4.x |
| Backend | NestJS, TypeScript, class-validator |
| Storage | JSON file (simulates database) |

## Project Structure

```
transaction-manager/
├── README.md
├── backend/
│   └── src/
│       ├── transactions/      # CRUD, import/export, similarity grouping
│       │   └── utils/         # CSV parsing, similarity algorithms
│       ├── categories/        # Category suggestions
│       └── data/              # JSON storage
└── frontend/
    ├── test.csv               # Sample CSV for testing
    └── src/
        ├── lib/
        │   ├── components/    # Svelte components
        │   ├── stores/        # Svelte 5 runes store
        │   ├── services/      # API client
        │   └── utils/         # Formatters, colors, selection helpers
        └── routes/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (with filters & sorting) |
| PATCH | `/api/transactions/:id` | Update single transaction |
| POST | `/api/transactions/bulk` | Bulk update transactions |
| GET | `/api/transactions/groups/similar` | Get similar transaction groups |
| POST | `/api/transactions/import` | Import from JSON data |
| POST | `/api/transactions/import/csv` | Import from CSV file upload |
| GET | `/api/transactions/export` | Export to CSV file |
| GET | `/api/categories` | List all categories |
| POST | `/api/categories/suggest` | Get category suggestions |

## Design Decisions

### Categorization Approach
- **Keyword Matching**: Backend maintains a map of keywords → categories (e.g., "uber" → "Transport")
- **On Load/Import**: Uncategorized transactions are sent to `/categories/suggest` for suggestions
- **User Control**: Users can accept, reject, or manually override any suggestion
- **Smart Grouping**: Backend groups similar transactions by merchant name using string similarity algorithms

### Data Processing Architecture
This application uses JSON file storage instead of a database. The architecture reflects what would typically be done at the database level:

- **Filtering & Sorting**: Handled by the backend using array methods (`.filter()`, `.sort()`). In a production system with a database, this would be SQL `WHERE` and `ORDER BY` clauses.
- **Pagination**: Handled by the frontend for simplicity. In a production system, this would use database-level `LIMIT`/`OFFSET` or cursor-based pagination to avoid loading all records into memory.
- **CSV Parsing & Similarity Grouping**: All business logic lives in the backend, keeping the frontend as a thin presentation layer.

### Frontend Architecture
- **Svelte 5 Runes**: `$state`, `$derived`, `$effect`, `$props` for reactive state management
- **Single Store**: Centralized transaction store that fetches pre-filtered/sorted data from the API
- **Portal Pattern**: Modals render at document.body to avoid z-index issues with header backdrop-blur

### Backend Architecture
- **NestJS Modules**: Separate modules for transactions and categories
- **File-based Storage**: JSON file loaded into memory on startup for fast reads
- **DTO Validation**: class-validator for request validation
- **Utility Functions**: CSV parsing and similarity grouping algorithms in dedicated utils

## Building for Production

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build && npm run preview
```

## License

MIT
