# Changelog

All notable changes to the AI Prompt Lab project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - User Authentication Module (2025-10-26)

#### Project Setup
- Initialized Next.js 15 project with TypeScript support
- Configured Tailwind CSS for styling
- Set up ESLint for code quality
- Added project structure with organized folders:
  - `src/app` - Next.js app router pages
  - `src/components` - Reusable React components
  - `src/lib` - Utility functions and configurations
  - `src/store` - State management
  - `src/types` - TypeScript type definitions

#### Authentication Infrastructure
- Integrated Supabase for authentication and future database needs
- Upgraded to @supabase/ssr package for better Next.js 15 compatibility
- Created Supabase client configurations:
  - `src/lib/supabase/client.ts` - Browser client
  - `src/lib/supabase/server.ts` - Server-side client
  - `src/lib/supabase/middleware.ts` - Session management middleware
- Implemented route middleware for:
  - Protecting authenticated routes (/dashboard, /prompts)
  - Redirecting logged-in users away from auth pages
  - Session refresh and validation

#### State Management
- Set up Zustand for lightweight state management
- Created auth store (`src/store/authStore.ts`) with:
  - User state management
  - Loading state tracking
  - Type-safe state updates
- Defined TypeScript types for authentication (`src/types/auth.ts`)

#### Authentication Components & Pages
- **AuthProvider Component** (`src/components/AuthProvider.tsx`):
  - Wraps application to provide auth context
  - Handles session initialization
  - Listens for authentication state changes
  - Updates global auth state

- **Navbar Component** (`src/components/Navbar.tsx`):
  - Displays app branding
  - Shows current user email
  - Logout functionality
  - Responsive design with Tailwind CSS

- **Login Page** (`src/app/login/page.tsx`):
  - Email/password login form
  - Form validation
  - Error handling and display
  - Loading states
  - Link to registration page
  - Gradient background design

- **Registration Page** (`src/app/register/page.tsx`):
  - Email/password registration form
  - Password confirmation validation
  - Minimum password length requirement (6 characters)
  - Success message with auto-redirect
  - Error handling and display
  - Link to login page

- **Dashboard Page** (`src/app/dashboard/page.tsx`):
  - Protected route requiring authentication
  - Welcome message with user email
  - Statistics cards for:
    - Total prompts (placeholder)
    - Active workflows (placeholder)
    - Pinned prompts (placeholder)
  - Coming soon notice for future features
  - Integrated navbar with logout

- **Home Page** (`src/app/page.tsx`):
  - Landing page with gradient design
  - Call-to-action buttons for Login/Register
  - Project branding and description

#### Authentication Logic
- Created auth helper functions (`src/lib/auth.ts`):
  - `signUp()` - User registration
  - `signIn()` - User login
  - `signOut()` - User logout
  - `getCurrentUser()` - Fetch current user data
- Implemented error handling for all auth operations
- Added TypeScript types for type safety

#### Configuration Files
- `.env.example` - Environment variable template with:
  - Supabase URL and API key placeholders
  - Claude API key placeholder for future integration
- `.gitignore` - Configured to exclude:
  - node_modules
  - .next build files
  - Environment variables
  - Build artifacts
- `package.json` - Project dependencies:
  - Next.js 15.0.2
  - React 18.3.1
  - Supabase SSR client
  - Zustand for state management
  - Tailwind CSS
  - TypeScript

#### Developer Experience
- TypeScript configuration (`tsconfig.json`)
- Path aliases configured (`@/*` → `./src/*`)
- Tailwind config with custom color variables
- PostCSS configuration
- ESLint configuration

### Configuration Notes
- Environment variables must be set in `.env.local` file
- Supabase project credentials required for authentication to work
- See `.env.example` for required environment variables

### Added - Database Schema & Infrastructure (2025-10-26)

#### Database Design
- Comprehensive PostgreSQL schema for AI Prompt Lab
- 6 core tables with relationships:
  - `prompts` - Store individual prompts with title, description, and content
  - `tags` - Categorization system with custom colors
  - `prompt_tags` - Many-to-many relationship between prompts and tags
  - `pinned_prompts` - Track user's favorited prompts
  - `workflows` - Multi-step workflow definitions
  - `workflow_steps` - Individual steps within workflows

#### Migration Files (`supabase/migrations/`)
- **20251026000001_initial_schema.sql**:
  - Table creation with proper constraints
  - Foreign key relationships with CASCADE delete
  - Full-text search indexes on prompts (title and content)
  - Performance indexes on all foreign keys
  - Composite indexes for optimized queries
  - Check constraints for data validation
  - Automatic `updated_at` trigger function
  - Comprehensive table comments

- **20251026000002_rls_policies.sql**:
  - Row Level Security (RLS) enabled on all tables
  - Complete policy set for each table (SELECT, INSERT, UPDATE, DELETE)
  - User isolation - users can only access their own data
  - Cascading security for related tables (prompt_tags, workflow_steps)
  - Secure pinning - users can only pin their own prompts
  - Workflow security - users can only manage their own workflows

#### TypeScript Types (`src/types/database.ts`)
- Complete type definitions for all database tables
- Insert types (without auto-generated fields)
- Update types (partial updates with proper constraints)
- Extended types with relationships:
  - `PromptWithTags` - Prompts with associated tags array
  - `WorkflowWithSteps` - Workflows with ordered steps
  - `WorkflowStepWithPrompt` - Steps with prompt details
- Database response type for Supabase client

#### Database Helper Functions
Created comprehensive helper libraries in `src/lib/database/`:

- **prompts.ts** - Prompt operations:
  - `getPrompts()` - Fetch all prompts with tags and pin status
  - `getPromptById(id)` - Single prompt with relationships
  - `searchPrompts(query)` - Full-text search by title/content
  - `getPromptsByTag(tagId)` - Filter prompts by tag
  - `getPinnedPrompts()` - Fetch user's pinned prompts
  - `createPrompt(data)` - Create new prompt
  - `updatePrompt(id, updates)` - Update existing prompt
  - `deletePrompt(id)` - Delete prompt (cascades to tags/pins)
  - `addTagsToPrompt(promptId, tagIds)` - Associate tags
  - `removeTagFromPrompt(promptId, tagId)` - Remove tag association
  - `pinPrompt(promptId, userId)` - Pin a prompt
  - `unpinPrompt(promptId, userId)` - Unpin a prompt
  - `getPromptCount()` - Count user's prompts

- **tags.ts** - Tag operations:
  - `getTags()` - Fetch all user's tags
  - `getTagById(id)` - Single tag by ID
  - `createTag(data)` - Create new tag
  - `updateTag(id, updates)` - Update tag
  - `deleteTag(id)` - Delete tag (removes from prompts)
  - `getTagsByPromptId(promptId)` - Get tags for specific prompt

- **workflows.ts** - Workflow operations:
  - `getWorkflows()` - Fetch all workflows
  - `getWorkflowById(id)` - Single workflow with ordered steps
  - `createWorkflow(data)` - Create new workflow
  - `updateWorkflow(id, updates)` - Update workflow
  - `deleteWorkflow(id)` - Delete workflow (cascades to steps)
  - `getWorkflowCount()` - Count user's workflows
  - `getWorkflowSteps(workflowId)` - Fetch ordered steps
  - `createWorkflowStep(data)` - Add step to workflow
  - `updateWorkflowStep(id, updates)` - Update step
  - `deleteWorkflowStep(id)` - Remove step
  - `reorderWorkflowSteps(workflowId, stepIds)` - Reorder steps

#### Documentation
- **DATABASE_SCHEMA.md** (`docs/DATABASE_SCHEMA.md`):
  - Complete schema documentation with ERD diagram
  - Detailed table descriptions with all columns
  - Index and constraint explanations
  - RLS policy documentation
  - Query examples for common operations
  - TypeScript type reference
  - Helper function API documentation
  - Migration instructions
  - Performance optimization tips
  - Future enhancement suggestions

- Updated **README.md**:
  - Database setup instructions
  - Migration application steps
  - Link to detailed schema documentation
  - Updated project structure
  - Updated roadmap showing completed Phase 1

#### Key Features
- **Security**: RLS ensures complete data isolation between users
- **Performance**: Strategic indexes for fast queries and full-text search
- **Flexibility**: Support for both saved prompts and custom prompts in workflows
- **Data Integrity**: Foreign key constraints with appropriate cascade rules
- **Type Safety**: Complete TypeScript coverage for all database operations
- **Developer Experience**: Helper functions abstract complex queries

#### Technical Highlights
- PostgreSQL full-text search with GIN indexes
- Automatic timestamp management via triggers
- Constraint checks for data validation
- Optimized many-to-many relationships
- Ordered workflow steps with integer positioning
- Color-coded tags for visual organization

### Next Steps
The following features are planned for future releases:
- Prompt management UI (CRUD operations)
- Tag management interface
- Multi-step workflow builder UI
- Search and filtering interface
- Pin/favorite functionality UI
- RICECO framework prompt generator
- Claude API integration for prompt testing
- Export/import functionality
