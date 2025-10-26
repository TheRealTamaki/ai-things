-- AI Prompt Lab Database Schema
-- Migration: Create initial database tables
-- Created: 2025-10-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PROMPTS TABLE
-- Stores individual AI prompts with metadata
-- ==============================================
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT prompts_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT prompts_content_length CHECK (char_length(content) >= 1)
);

-- Index for faster queries
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_title ON prompts USING gin(to_tsvector('english', title));
CREATE INDEX idx_prompts_content ON prompts USING gin(to_tsvector('english', content));

-- ==============================================
-- TAGS TABLE
-- Categorization tags for organizing prompts
-- ==============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT tags_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
    CONSTRAINT tags_unique_per_user UNIQUE (user_id, name)
);

-- Index for faster queries
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- ==============================================
-- PROMPT_TAGS TABLE
-- Many-to-many relationship between prompts and tags
-- ==============================================
CREATE TABLE prompt_tags (
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (prompt_id, tag_id)
);

-- Index for faster queries
CREATE INDEX idx_prompt_tags_prompt_id ON prompt_tags(prompt_id);
CREATE INDEX idx_prompt_tags_tag_id ON prompt_tags(tag_id);

-- ==============================================
-- PINNED_PROMPTS TABLE
-- User's favorited/pinned prompts for quick access
-- ==============================================
CREATE TABLE pinned_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    pinned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pinned_prompts_unique UNIQUE (user_id, prompt_id)
);

-- Index for faster queries
CREATE INDEX idx_pinned_prompts_user_id ON pinned_prompts(user_id);
CREATE INDEX idx_pinned_prompts_prompt_id ON pinned_prompts(prompt_id);

-- ==============================================
-- WORKFLOWS TABLE
-- Multi-step workflows containing multiple prompts
-- ==============================================
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT workflows_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Index for faster queries
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);

-- ==============================================
-- WORKFLOW_STEPS TABLE
-- Individual steps within workflows
-- ==============================================
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    step_order INTEGER NOT NULL,
    custom_prompt TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT workflow_steps_order_positive CHECK (step_order > 0),
    CONSTRAINT workflow_steps_has_prompt CHECK (prompt_id IS NOT NULL OR custom_prompt IS NOT NULL)
);

-- Index for faster queries
CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(workflow_id, step_order);

-- ==============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically update updated_at timestamp
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- COMMENTS
-- Add descriptive comments to tables
-- ==============================================
COMMENT ON TABLE prompts IS 'Stores individual AI prompts with metadata';
COMMENT ON TABLE tags IS 'Categorization tags for organizing prompts';
COMMENT ON TABLE prompt_tags IS 'Many-to-many relationship between prompts and tags';
COMMENT ON TABLE pinned_prompts IS 'User favorited/pinned prompts for quick access';
COMMENT ON TABLE workflows IS 'Multi-step workflows containing multiple prompts';
COMMENT ON TABLE workflow_steps IS 'Individual steps within workflows';
