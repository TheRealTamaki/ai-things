# AI Prompt Lab

A comprehensive prompt management system designed for content creators who need to efficiently organize, store, and retrieve their AI prompts and JSON configurations. Built with Next.js, TypeScript, and Supabase.

## Features

### Currently Implemented (v0.1.0)

- **User Authentication System**
  - Email/password registration
  - Secure login with Supabase
  - Session management
  - Protected routes
  - User dashboard

### Coming Soon

- Prompt CRUD operations (Create, Read, Update, Delete)
- Multi-step workflow functionality
- Prompt favoriting/pinning
- Full-text search across prompts
- Save/load operations for prompt collections
- RICECO framework prompt generator (Role, Instructions, Context, Examples, Constraints, Output)
- Claude API integration for prompt testing and validation
- Export/import functionality

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Deployment**: Vercel-ready

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd ai-things
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Once your project is created, go to **Settings** > **API**
3. Copy your **Project URL** and **anon/public key**
4. Apply database migrations:
   - Go to **SQL Editor** in your Supabase dashboard
   - Run the SQL scripts from `supabase/migrations/` in order:
     - First: `20251026000001_initial_schema.sql`
     - Second: `20251026000002_rls_policies.sql`

### 4. Configure Environment Variables

1. Copy the example environment file:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Edit \`.env.local\` and add your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

\`\`\`
ai-things/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── dashboard/        # Protected dashboard page
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── AuthProvider.tsx  # Authentication context provider
│   │   └── Navbar.tsx        # Navigation bar
│   ├── lib/                  # Utilities and configurations
│   │   ├── supabase/         # Supabase client configurations
│   │   │   ├── client.ts     # Browser client
│   │   │   ├── server.ts     # Server-side client
│   │   │   └── middleware.ts # Auth middleware
│   │   ├── database/         # Database helper functions
│   │   │   ├── prompts.ts    # Prompt operations
│   │   │   ├── tags.ts       # Tag operations
│   │   │   └── workflows.ts  # Workflow operations
│   │   └── auth.ts           # Authentication helpers
│   ├── store/                # State management
│   │   └── authStore.ts      # Authentication state
│   └── types/                # TypeScript type definitions
│       ├── auth.ts           # Auth-related types
│       └── database.ts       # Database schema types
├── supabase/
│   └── migrations/           # Database migration files
├── docs/
│   └── DATABASE_SCHEMA.md    # Database schema documentation
├── middleware.ts             # Next.js middleware for route protection
├── .env.example              # Environment variables template
├── CHANGELOG.md              # Project changelog
└── package.json              # Project dependencies
\`\`\`

## Usage

### Register a New Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click on the **Register** button
3. Enter your email and password (minimum 6 characters)
4. Confirm your password
5. Click **Create account**
6. You'll be redirected to the login page

### Login

1. Navigate to the **Login** page
2. Enter your registered email and password
3. Click **Sign in**
4. You'll be redirected to the dashboard

### Dashboard

Once logged in, you'll have access to the dashboard which displays:
- Your email address
- Statistics cards (placeholders for future features)
- Navigation bar with logout functionality

### Logout

Click the **Logout** button in the navigation bar to sign out.

## Authentication Flow

The application uses Supabase for authentication with the following flow:

1. **Registration**: Users create an account with email/password
2. **Login**: Users authenticate with their credentials
3. **Session Management**: Middleware automatically handles session refresh
4. **Protected Routes**: Dashboard and future prompt pages require authentication
5. **Logout**: Users can sign out, clearing their session

## Development

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code quality
- Prettier-compatible formatting (via Next.js)

## Database Schema

The database schema is now implemented and ready to use. It includes:

- **prompts** - Individual prompts with metadata (title, description, content)
- **tags** - Categorization tags with custom colors
- **prompt_tags** - Many-to-many relationship between prompts and tags
- **pinned_prompts** - User's favorited prompts for quick access
- **workflows** - Multi-step workflows
- **workflow_steps** - Individual steps within workflows

**Key Features:**
- Full-text search on prompt titles and content
- Row Level Security (RLS) ensuring users can only access their own data
- Automatic timestamp management
- Comprehensive indexes for performance
- TypeScript types for all database operations

For detailed schema documentation, see [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

## Roadmap

### Phase 1: Authentication & Database (Completed)
- ✅ User registration and login
- ✅ Session management
- ✅ Protected routes
- ✅ User dashboard
- ✅ Database schema design
- ✅ Migration files
- ✅ Row Level Security policies
- ✅ Database helper functions
- ✅ TypeScript types

### Phase 2: Prompt Management (Next)
- [ ] Create, edit, and delete prompts
- [ ] Prompt listing and viewing
- [ ] Tag management
- [ ] Pin/unpin functionality

### Phase 3: Search & Organization
- [ ] Full-text search
- [ ] Filter by tags
- [ ] Sort options
- [ ] Bulk operations

### Phase 4: Workflows
- [ ] Create multi-step workflows
- [ ] Assign prompts to workflow steps
- [ ] Execute workflows
- [ ] Workflow templates

### Phase 5: Advanced Features
- [ ] RICECO framework generator
- [ ] Claude API integration
- [ ] Export/import functionality
- [ ] Prompt versioning

## Contributing

This project is currently in active development. Contributions, issues, and feature requests are welcome!

## License

[Add your license here]

## Support

For questions or issues, please open an issue in the repository.

---

**Note**: This application requires a Supabase account to function. The free tier is sufficient for development and testing purposes.
