-- AI Prompt Lab Row Level Security Policies
-- Migration: Enable RLS and create security policies
-- Created: 2025-10-26

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PROMPTS POLICIES
-- Users can only manage their own prompts
-- ==============================================

-- Allow users to view their own prompts
CREATE POLICY "Users can view own prompts"
    ON prompts FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own prompts
CREATE POLICY "Users can insert own prompts"
    ON prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own prompts
CREATE POLICY "Users can update own prompts"
    ON prompts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own prompts
CREATE POLICY "Users can delete own prompts"
    ON prompts FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- TAGS POLICIES
-- Users can only manage their own tags
-- ==============================================

-- Allow users to view their own tags
CREATE POLICY "Users can view own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own tags
CREATE POLICY "Users can insert own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tags
CREATE POLICY "Users can update own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own tags
CREATE POLICY "Users can delete own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- PROMPT_TAGS POLICIES
-- Users can only manage tags for their own prompts
-- ==============================================

-- Allow users to view tags for their own prompts
CREATE POLICY "Users can view own prompt tags"
    ON prompt_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_tags.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- Allow users to insert tags for their own prompts
CREATE POLICY "Users can insert own prompt tags"
    ON prompt_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_tags.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- Allow users to delete tags from their own prompts
CREATE POLICY "Users can delete own prompt tags"
    ON prompt_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_tags.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- ==============================================
-- PINNED_PROMPTS POLICIES
-- Users can only manage their own pinned prompts
-- ==============================================

-- Allow users to view their own pinned prompts
CREATE POLICY "Users can view own pinned prompts"
    ON pinned_prompts FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own pinned prompts
CREATE POLICY "Users can insert own pinned prompts"
    ON pinned_prompts FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = pinned_prompts.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- Allow users to delete their own pinned prompts
CREATE POLICY "Users can delete own pinned prompts"
    ON pinned_prompts FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- WORKFLOWS POLICIES
-- Users can only manage their own workflows
-- ==============================================

-- Allow users to view their own workflows
CREATE POLICY "Users can view own workflows"
    ON workflows FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own workflows
CREATE POLICY "Users can insert own workflows"
    ON workflows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own workflows
CREATE POLICY "Users can update own workflows"
    ON workflows FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own workflows
CREATE POLICY "Users can delete own workflows"
    ON workflows FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- WORKFLOW_STEPS POLICIES
-- Users can only manage steps in their own workflows
-- ==============================================

-- Allow users to view steps in their own workflows
CREATE POLICY "Users can view own workflow steps"
    ON workflow_steps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workflows
            WHERE workflows.id = workflow_steps.workflow_id
            AND workflows.user_id = auth.uid()
        )
    );

-- Allow users to insert steps in their own workflows
CREATE POLICY "Users can insert own workflow steps"
    ON workflow_steps FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflows
            WHERE workflows.id = workflow_steps.workflow_id
            AND workflows.user_id = auth.uid()
        )
    );

-- Allow users to update steps in their own workflows
CREATE POLICY "Users can update own workflow steps"
    ON workflow_steps FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workflows
            WHERE workflows.id = workflow_steps.workflow_id
            AND workflows.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflows
            WHERE workflows.id = workflow_steps.workflow_id
            AND workflows.user_id = auth.uid()
        )
    );

-- Allow users to delete steps in their own workflows
CREATE POLICY "Users can delete own workflow steps"
    ON workflow_steps FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workflows
            WHERE workflows.id = workflow_steps.workflow_id
            AND workflows.user_id = auth.uid()
        )
    );
