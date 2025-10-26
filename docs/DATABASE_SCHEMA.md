# Database Schema Documentation

This document provides a comprehensive overview of the AI Prompt Lab database schema.

## Overview

The database uses PostgreSQL (via Supabase) and consists of 6 main tables:
- `prompts` - Individual AI prompts
- `tags` - Categorization tags
- `prompt_tags` - Many-to-many relationship between prompts and tags
- `pinned_prompts` - User's favorited prompts
- `workflows` - Multi-step workflows
- `workflow_steps` - Individual steps within workflows

## Entity Relationship Diagram

```
┌─────────────┐
│   auth.users│
└──────┬──────┘
       │
       ├───────────────────────────────────────┐
       │                                       │
       │                                       │
┌──────▼──────┐        ┌──────────────┐       │
│   prompts   │◄───────┤ prompt_tags  │       │
│             │        └──────┬───────┘       │
│  - id (PK)  │               │               │
│  - user_id  │        ┌──────▼──────┐        │
│  - title    │        │    tags     │◄───────┤
│  - content  │        │             │        │
│  - ...      │        │  - id (PK)  │        │
└──────┬──────┘        │  - user_id  │        │
       │               │  - name     │        │
       │               └─────────────┘        │
       │                                      │
┌──────▼──────────┐                           │
│ pinned_prompts  │                           │
│                 │                           │
│  - id (PK)      │                           │
│  - user_id      │                           │
│  - prompt_id    │                           │
└─────────────────┘                           │
                                              │
                       ┌──────────────────────┤
                       │                      │
                ┌──────▼──────┐               │
                │  workflows  │◄──────────────┘
                │             │
                │  - id (PK)  │
                │  - user_id  │
                │  - name     │
                └──────┬──────┘
                       │
                ┌──────▼──────────┐
                │ workflow_steps  │
                │                 │
                │  - id (PK)      │
                │  - workflow_id  │
                │  - prompt_id    │
                │  - step_order   │
                └─────────────────┘
```

## Tables

### 1. prompts

Stores individual AI prompts with metadata.

| Column      | Type                     | Constraints                    | Description                    |
|-------------|--------------------------|--------------------------------|--------------------------------|
| id          | UUID                     | PRIMARY KEY, DEFAULT uuid_v4() | Unique identifier              |
| user_id     | UUID                     | NOT NULL, FK → auth.users      | Owner of the prompt            |
| title       | TEXT                     | NOT NULL, 1-255 chars          | Prompt title                   |
| description | TEXT                     | NULLABLE                       | Optional description           |
| content     | TEXT                     | NOT NULL                       | The actual prompt content      |
| created_at  | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Creation timestamp             |
| updated_at  | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Last update timestamp          |

**Indexes:**
- `idx_prompts_user_id` - Fast user lookups
- `idx_prompts_created_at` - Sorted retrieval
- `idx_prompts_title` - Full-text search on title
- `idx_prompts_content` - Full-text search on content

**Triggers:**
- `update_prompts_updated_at` - Auto-updates `updated_at` on row changes

---

### 2. tags

Categorization tags for organizing prompts.

| Column     | Type                     | Constraints                    | Description               |
|------------|--------------------------|--------------------------------|---------------------------|
| id         | UUID                     | PRIMARY KEY, DEFAULT uuid_v4() | Unique identifier         |
| user_id    | UUID                     | NOT NULL, FK → auth.users      | Owner of the tag          |
| name       | TEXT                     | NOT NULL, 1-50 chars           | Tag name                  |
| color      | TEXT                     | DEFAULT '#3B82F6'              | Display color (hex)       |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Creation timestamp        |

**Constraints:**
- `tags_unique_per_user` - UNIQUE(user_id, name)

**Indexes:**
- `idx_tags_user_id` - Fast user lookups

---

### 3. prompt_tags

Many-to-many junction table between prompts and tags.

| Column     | Type                     | Constraints               | Description          |
|------------|--------------------------|---------------------------|----------------------|
| prompt_id  | UUID                     | FK → prompts, ON DELETE CASCADE | Reference to prompt  |
| tag_id     | UUID                     | FK → tags, ON DELETE CASCADE    | Reference to tag     |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()             | Creation timestamp   |

**Primary Key:** (prompt_id, tag_id)

**Indexes:**
- `idx_prompt_tags_prompt_id` - Fast prompt lookups
- `idx_prompt_tags_tag_id` - Fast tag lookups

---

### 4. pinned_prompts

User's favorited/pinned prompts for quick access.

| Column     | Type                     | Constraints                    | Description          |
|------------|--------------------------|--------------------------------|----------------------|
| id         | UUID                     | PRIMARY KEY, DEFAULT uuid_v4() | Unique identifier    |
| user_id    | UUID                     | NOT NULL, FK → auth.users      | User who pinned      |
| prompt_id  | UUID                     | NOT NULL, FK → prompts         | Pinned prompt        |
| pinned_at  | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Pin timestamp        |

**Constraints:**
- `pinned_prompts_unique` - UNIQUE(user_id, prompt_id)

**Indexes:**
- `idx_pinned_prompts_user_id` - Fast user lookups
- `idx_pinned_prompts_prompt_id` - Fast prompt lookups

---

### 5. workflows

Multi-step workflows containing multiple prompts.

| Column      | Type                     | Constraints                    | Description               |
|-------------|--------------------------|--------------------------------|---------------------------|
| id          | UUID                     | PRIMARY KEY, DEFAULT uuid_v4() | Unique identifier         |
| user_id     | UUID                     | NOT NULL, FK → auth.users      | Owner of the workflow     |
| name        | TEXT                     | NOT NULL, 1-255 chars          | Workflow name             |
| description | TEXT                     | NULLABLE                       | Optional description      |
| created_at  | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Creation timestamp        |
| updated_at  | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Last update timestamp     |

**Indexes:**
- `idx_workflows_user_id` - Fast user lookups
- `idx_workflows_created_at` - Sorted retrieval

**Triggers:**
- `update_workflows_updated_at` - Auto-updates `updated_at` on row changes

---

### 6. workflow_steps

Individual steps within workflows.

| Column        | Type                     | Constraints                    | Description                      |
|---------------|--------------------------|--------------------------------|----------------------------------|
| id            | UUID                     | PRIMARY KEY, DEFAULT uuid_v4() | Unique identifier                |
| workflow_id   | UUID                     | NOT NULL, FK → workflows       | Parent workflow                  |
| prompt_id     | UUID                     | FK → prompts, ON DELETE SET NULL | Referenced prompt (optional)   |
| step_order    | INTEGER                  | NOT NULL, > 0                  | Order within workflow            |
| custom_prompt | TEXT                     | NULLABLE                       | Custom prompt (if no prompt_id)  |
| notes         | TEXT                     | NULLABLE                       | Additional notes                 |
| created_at    | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | Creation timestamp               |

**Constraints:**
- `workflow_steps_has_prompt` - CHECK(prompt_id IS NOT NULL OR custom_prompt IS NOT NULL)

**Indexes:**
- `idx_workflow_steps_workflow_id` - Fast workflow lookups
- `idx_workflow_steps_order` - Sorted step retrieval

---

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data.

### Policy Pattern

For each table, the following policies are implemented:

1. **SELECT** - Users can view only their own records
2. **INSERT** - Users can insert records associated with their user_id
3. **UPDATE** - Users can update only their own records
4. **DELETE** - Users can delete only their own records

### Special Cases

**prompt_tags:**
- Users can only manage tags for prompts they own

**pinned_prompts:**
- Users can only pin/unpin their own prompts

**workflow_steps:**
- Users can only manage steps in workflows they own

---

## Query Examples

### Get all prompts with tags

```sql
SELECT p.*,
       array_agg(t.*) as tags
FROM prompts p
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.user_id = auth.uid()
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Search prompts by content

```sql
SELECT * FROM prompts
WHERE user_id = auth.uid()
  AND (
    to_tsvector('english', title) @@ plainto_tsquery('english', 'search term')
    OR to_tsvector('english', content) @@ plainto_tsquery('english', 'search term')
  )
ORDER BY created_at DESC;
```

### Get workflow with all steps

```sql
SELECT w.*,
       json_agg(
         json_build_object(
           'id', ws.id,
           'step_order', ws.step_order,
           'prompt', p.*,
           'custom_prompt', ws.custom_prompt,
           'notes', ws.notes
         ) ORDER BY ws.step_order
       ) as steps
FROM workflows w
LEFT JOIN workflow_steps ws ON w.id = ws.workflow_id
LEFT JOIN prompts p ON ws.prompt_id = p.id
WHERE w.id = 'workflow-uuid'
  AND w.user_id = auth.uid()
GROUP BY w.id;
```

---

## TypeScript Types

All database tables have corresponding TypeScript types in `/src/types/database.ts`:

- `Prompt`, `PromptInsert`, `PromptUpdate`
- `Tag`, `TagInsert`, `TagUpdate`
- `PromptTag`, `PromptTagInsert`
- `PinnedPrompt`, `PinnedPromptInsert`
- `Workflow`, `WorkflowInsert`, `WorkflowUpdate`
- `WorkflowStep`, `WorkflowStepInsert`, `WorkflowStepUpdate`

Extended types with relationships:
- `PromptWithTags`
- `WorkflowWithSteps`
- `WorkflowStepWithPrompt`

---

## Database Helper Functions

Helper functions are available in `/src/lib/database/`:

### Prompts (`/src/lib/database/prompts.ts`)
- `getPrompts()` - Get all prompts
- `getPromptById(id)` - Get single prompt
- `searchPrompts(query)` - Search prompts
- `getPromptsByTag(tagId)` - Filter by tag
- `getPinnedPrompts()` - Get pinned prompts
- `createPrompt(data)` - Create new prompt
- `updatePrompt(id, data)` - Update prompt
- `deletePrompt(id)` - Delete prompt
- `pinPrompt(promptId, userId)` - Pin prompt
- `unpinPrompt(promptId, userId)` - Unpin prompt

### Tags (`/src/lib/database/tags.ts`)
- `getTags()` - Get all tags
- `getTagById(id)` - Get single tag
- `createTag(data)` - Create new tag
- `updateTag(id, data)` - Update tag
- `deleteTag(id)` - Delete tag

### Workflows (`/src/lib/database/workflows.ts`)
- `getWorkflows()` - Get all workflows
- `getWorkflowById(id)` - Get workflow with steps
- `createWorkflow(data)` - Create new workflow
- `updateWorkflow(id, data)` - Update workflow
- `deleteWorkflow(id)` - Delete workflow
- `createWorkflowStep(data)` - Add step to workflow
- `updateWorkflowStep(id, data)` - Update step
- `deleteWorkflowStep(id)` - Delete step
- `reorderWorkflowSteps(workflowId, stepIds)` - Reorder steps

---

## Migration Instructions

### 1. Apply Migrations

Run migrations in order:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard
# 1. Go to SQL Editor
# 2. Run 20251026000001_initial_schema.sql
# 3. Run 20251026000002_rls_policies.sql
```

### 2. Verify Setup

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname
FROM pg_policies;
```

---

## Performance Considerations

### Indexes
- Full-text search indexes on `prompts.title` and `prompts.content`
- Foreign key indexes for all relationships
- Composite index on `workflow_steps(workflow_id, step_order)` for ordered retrieval

### Optimization Tips
1. Use `.select()` with specific columns instead of `*` when possible
2. Leverage full-text search for large content searches
3. Use pagination for large result sets
4. Consider caching frequently accessed data (tags, pinned prompts)

---

## Future Enhancements

Potential schema additions:
- **prompt_versions** - Version history for prompts
- **prompt_executions** - Store Claude API execution results
- **collections** - Group related prompts
- **templates** - Pre-built prompt templates
- **analytics** - Usage statistics and metrics
