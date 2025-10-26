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

### Added - Prompt CRUD Operations & Tag Management (2025-10-26)

#### Prompt Management UI
Complete UI implementation for managing prompts with full CRUD operations:

**Prompts List Page** (`src/app/prompts/page.tsx`):
- Grid layout displaying all prompts as cards
- Filter tabs for "All Prompts" and "Pinned" prompts
- Real-time pin/unpin functionality
- Delete confirmation dialogs
- Empty states with helpful messaging
- Loading states during data fetch
- Error handling with user-friendly messages
- Responsive design (mobile, tablet, desktop)
- Quick action buttons (Edit, Delete) on each card

**Create Prompt Page** (`src/app/prompts/new/page.tsx`):
- Full-featured form for creating new prompts
- Title field with 255 character limit
- Description field (optional)
- Content textarea with character counter
- Tag selection with visual toggle buttons
- Form validation (required fields)
- Error handling and display
- Cancel navigation

**Prompt Detail/View Page** (`src/app/prompts/[id]/page.tsx`):
- Full prompt display with metadata
- Pin/unpin toggle in header
- Tag display with custom colors
- Created/Updated timestamps
- Copy to clipboard functionality
- Responsive layout
- Quick actions (Edit, Delete)
- Back navigation

**Edit Prompt Page** (`src/app/prompts/[id]/edit/page.tsx`):
- Pre-populated form with existing data
- Tag management (add/remove tags)
- Update prompt details
- Form validation
- Cancel navigation back to detail view

#### Reusable Components

**PromptCard Component** (`src/components/prompts/PromptCard.tsx`):
- Card-based prompt display
- Title, description, content preview (line-clamped)
- Tag badges with custom colors
- Pin indicator (filled/outlined icon)
- Creation date
- Quick action buttons
- Hover effects and transitions
- Clickable to navigate to detail view

**PromptForm Component** (`src/components/prompts/PromptForm.tsx`):
- Reusable form for create/edit operations
- Field validation (required fields, max lengths)
- Tag multi-select with toggle UI
- Character counter for content
- Loading and error states
- Customizable submit button label
- Cancel callback support

**DeleteConfirmDialog Component** (`src/components/DeleteConfirmDialog.tsx`):
- Modal confirmation dialog
- Warning icon and messaging
- Confirm/Cancel actions
- Loading state during deletion
- Backdrop click to cancel
- Accessible and responsive

#### Tag Management System

**Tags Page** (`src/app/tags/page.tsx`):
- Full tag CRUD interface
- Create new tags with custom names and colors
- Edit existing tags
- Delete tags (removes from all prompts)
- Color picker with preset palette
- Live preview of tag appearance
- Delete confirmation dialogs
- Empty states
- Loading and error handling

**Tag Features**:
- 8 preset colors (blue, green, amber, red, purple, pink, teal, orange)
- Custom color picker for unlimited colors
- 50 character name limit
- Unique names per user
- Visual tag preview before saving
- Tags displayed with custom background colors
- Tag assignment in prompt forms

#### Dashboard Enhancements

**Updated Dashboard** (`src/app/dashboard/page.tsx`):
- Real-time statistics from database:
  - Total prompts count
  - Total workflows count
  - Pinned prompts count
  - Tags count
- Clickable stat cards linking to relevant pages
- Icon-enhanced statistics cards
- Quick actions section with:
  - Create new prompt
  - Manage tags
  - Browse prompts
- Improved layout and visual hierarchy
- Loading states for statistics
- Coming soon notice for future features

#### Features Implemented

**Pin/Unpin Functionality**:
- Toggle pin status from list view
- Toggle pin status from detail view
- Visual indicators (filled/outlined icons)
- Dedicated "Pinned" filter tab
- Real-time updates across all views

**Delete Functionality**:
- Confirmation dialogs for safety
- Delete from list view
- Delete from detail view
- Cascading deletes (removes tags, pins)
- Loading states during deletion
- Success/error handling

**Tag Association**:
- Multi-tag assignment in create/edit forms
- Visual tag toggles with color preview
- Add/remove tags when editing
- Display tags on prompt cards and detail views
- Tag deletion removes from all prompts

**Loading & Error States**:
- Skeleton/spinner loading indicators
- Empty state messaging
- Error messages with context
- Retry mechanisms
- Graceful degradation

**Navigation & UX**:
- Breadcrumb navigation
- Back buttons with proper routing
- Keyboard accessibility
- Responsive design for all screen sizes
- Smooth transitions and hover effects
- Consistent color scheme (dark mode support)

#### File Structure

```
src/
├── app/
│   ├── prompts/
│   │   ├── page.tsx                    # Prompts list with filtering
│   │   ├── new/page.tsx                # Create new prompt
│   │   └── [id]/
│   │       ├── page.tsx                # Prompt detail view
│   │       └── edit/page.tsx           # Edit prompt
│   ├── tags/page.tsx                   # Tag management
│   └── dashboard/page.tsx              # Updated with real stats
├── components/
│   ├── prompts/
│   │   ├── PromptCard.tsx              # Reusable prompt card
│   │   └── PromptForm.tsx              # Reusable prompt form
│   └── DeleteConfirmDialog.tsx         # Confirmation modal
└── lib/database/
    ├── prompts.ts                      # Used for all prompt operations
    ├── tags.ts                         # Used for tag operations
    └── workflows.ts                    # Used for workflow counts
```

#### Technical Highlights

- **Type Safety**: Full TypeScript coverage with database types
- **Performance**: Optimized queries with proper indexes
- **Security**: RLS policies ensure user data isolation
- **UX**: Loading states, error handling, empty states
- **Accessibility**: Semantic HTML, keyboard navigation
- **Responsive**: Mobile-first design, works on all devices
- **State Management**: React hooks with proper dependency management
- **Code Reusability**: Shared components reduce duplication

#### User Workflows

**Creating a Prompt**:
1. Click "New Prompt" from dashboard or prompts page
2. Fill in title (required) and optional description
3. Enter prompt content (required)
4. Select tags (optional)
5. Click "Create Prompt"
6. Redirected to prompts list

**Editing a Prompt**:
1. Click "Edit" on prompt card or detail view
2. Modify any fields
3. Add/remove tags
4. Click "Save Changes"
5. Redirected to detail view

**Managing Tags**:
1. Navigate to Tags page
2. Click "New Tag" to create
3. Choose name and color
4. Preview before saving
5. Edit or delete existing tags

**Pin/Unpin Prompts**:
1. Click pin icon on any prompt card
2. Or toggle from detail view
3. View all pinned prompts via "Pinned" tab
4. Quick access to favorites

### Added - Workflow Builder (2025-10-26)

#### Multi-Step Workflow System
Complete workflow builder implementation for creating and managing multi-step prompt sequences:

**Workflows List Page** (`src/app/workflows/page.tsx`):
- Grid layout displaying all workflows as cards
- Step count badge on each workflow
- Delete confirmation dialogs
- Empty states with helpful messaging
- Loading states during data fetch
- Create new workflow button
- Responsive design

**Create Workflow Page** (`src/app/workflows/new/page.tsx`):
- Simple form for workflow name and description
- Redirects to detail page after creation for step management
- Form validation
- Cancel navigation

**Workflow Detail Page** (`src/app/workflows/[id]/page.tsx`):
- Full workflow display with metadata
- Ordered list of all workflow steps
- Add new steps functionality
- Edit existing steps
- Delete steps with confirmation
- Reorder steps (move up/down)
- Delete entire workflow
- Empty state when no steps exist
- Comprehensive step management

**Edit Workflow Page** (`src/app/workflows/[id]/edit/page.tsx`):
- Update workflow name and description
- Pre-populated form with existing data
- Cancel navigation back to detail view

#### Workflow Components

**WorkflowCard Component** (`src/components/workflows/WorkflowCard.tsx`):
- Card-based workflow display
- Name, description preview
- Step count badge
- Creation date
- Quick action buttons (Edit, Delete)
- Hover effects and transitions
- Clickable to navigate to detail view

**WorkflowForm Component** (`src/components/workflows/WorkflowForm.tsx`):
- Reusable form for create/edit operations
- Name and description fields
- Form validation (required fields, max lengths)
- Loading and error states
- Customizable submit button label
- Cancel callback support

**StepCard Component** (`src/components/workflows/StepCard.tsx`):
- Displays individual workflow steps
- Step number badge
- Shows saved prompt OR custom prompt
- Displays prompt content with preview
- Optional notes section with highlighting
- Action buttons (Edit, Delete, Move Up/Down)
- Visual differentiation (saved vs custom)
- Disabled move buttons at boundaries

**AddStepDialog Component** (`src/components/workflows/AddStepDialog.tsx`):
- Modal dialog for adding/editing steps
- Toggle between "Saved Prompt" and "Custom Prompt" modes
- Dropdown to select from user's saved prompts
- Textarea for custom prompt input
- Optional notes field
- Live validation
- Loading states
- Handles both add and edit modes

#### Features Implemented

**Workflow Management**:
- Create workflows with name and description
- Edit workflow details
- Delete workflows (cascades to all steps)
- View all workflows in grid layout
- Step count tracking

**Step Management**:
- Add steps using saved prompts or custom prompts
- Edit existing steps
- Delete individual steps
- Reorder steps with up/down buttons
- Automatic step numbering
- Support for step notes/instructions

**Step Types**:
- **Saved Prompt Steps**: Reference existing prompts from library
- **Custom Prompt Steps**: Write one-off prompts directly
- Visual badges to differentiate step types
- Display full prompt content in each step

**Step Reordering**:
- Move up/down buttons on each step
- Disabled at list boundaries
- Updates step_order in database
- Maintains sequential order
- Real-time UI updates

**User Experience**:
- Empty states for workflows and steps
- Loading indicators during operations
- Error messages with context
- Confirmation dialogs for destructive actions
- Breadcrumb navigation
- Cancel buttons throughout

**Navigation Enhancement**:
- Updated Navbar with navigation links
- Active link highlighting
- Links to Dashboard, Prompts, Workflows, Tags
- Responsive nav (hidden on mobile)
- Consistent across all pages

#### File Structure

```
src/
├── app/
│   └── workflows/
│       ├── page.tsx                    # Workflows list
│       ├── new/page.tsx                # Create workflow
│       └── [id]/
│           ├── page.tsx                # Workflow detail with steps
│           └── edit/page.tsx           # Edit workflow
├── components/
│   ├── workflows/
│   │   ├── WorkflowCard.tsx            # Reusable workflow card
│   │   ├── WorkflowForm.tsx            # Reusable workflow form
│   │   ├── StepCard.tsx                # Step display card
│   │   └── AddStepDialog.tsx           # Add/edit step modal
│   └── Navbar.tsx                      # Updated with nav links
└── lib/database/
    └── workflows.ts                    # All workflow operations used
```

#### Technical Highlights

- **Type Safety**: Full TypeScript coverage with workflow and step types
- **Database Operations**: Efficient use of helper functions from workflows.ts
- **State Management**: React hooks with proper dependency management
- **Cascading Deletes**: Workflow deletion removes all steps
- **Order Management**: Step reordering with sequential integrity
- **Flexible Design**: Support for both saved and custom prompts
- **Component Reusability**: Shared components reduce duplication

#### User Workflows

**Creating a Workflow**:
1. Click "New Workflow" from workflows page
2. Enter workflow name and optional description
3. Click "Create Workflow"
4. Redirected to detail page
5. Add steps using saved prompts or custom text
6. Reorder steps as needed

**Adding Steps**:
1. Click "Add Step" button
2. Choose "Saved Prompt" or "Custom Prompt"
3. Select prompt or write custom text
4. Add optional notes
5. Click "Add Step"
6. Step appears in sequence

**Managing Steps**:
1. Edit step content by clicking edit icon
2. Delete steps with confirmation
3. Reorder using up/down arrows
4. View full prompt content in each step

**Executing a Workflow**:
1. View workflow detail page
2. See all steps in order
3. Each step displays its prompt content
4. Copy prompts as needed for execution

### Next Steps
The following features are planned for future releases:
- Full-text search interface for prompts and workflows
- Workflow execution mode with step-by-step navigation
- RICECO framework prompt generator
- Claude API integration for prompt testing
- Export/import functionality for workflows
- Prompt versioning system
- Workflow templates and sharing
