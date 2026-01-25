"""add_waitlist_spam_protection_and_crm_sync

Revision ID: 0bbd9a03d5bc
Revises: ec45f2f8f2b7
Create Date: 2026-01-24 22:47:35.000000

This migration adds:
1. Spam detection fields to cms_waitlist_submissions
2. CRM sync tracking fields
3. Database trigger to auto-sync approved submissions to TwentyCRM
4. Indexes for performance
5. Marks existing spam submissions

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0bbd9a03d5bc"
down_revision: Union[str, None] = "f9a3b2c1d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add spam protection and CRM sync functionality."""

    # 1. Add spam detection and CRM sync fields
    op.execute(
        """
        ALTER TABLE public.cms_waitlist_submissions
        ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS spam_factors JSONB,
        ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES directus_users(id),
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS sync_to_crm BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS crm_person_id UUID;
    """
    )

    # 2. Add indexes for performance
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_waitlist_status_spam
        ON public.cms_waitlist_submissions(status, spam_score);

        CREATE INDEX IF NOT EXISTS idx_waitlist_sync
        ON public.cms_waitlist_submissions(sync_to_crm, status)
        WHERE sync_to_crm = false;

        CREATE INDEX IF NOT EXISTS idx_waitlist_email
        ON public.cms_waitlist_submissions(email);
    """
    )

    # 3. Create function to sync waitlist to CRM
    op.execute(
        """
        CREATE OR REPLACE FUNCTION sync_waitlist_to_crm()
        RETURNS TRIGGER AS $$
        DECLARE
            workspace_schema TEXT := 'workspace_xyn38v2d4hcz2u1poledaq02';
            new_person_id UUID;
        BEGIN
            -- Only sync if status changed to 'approved' and not already synced
            IF NEW.status = 'approved' AND
               (OLD.status IS NULL OR OLD.status != 'approved') AND
               NEW.sync_to_crm = false AND
               NEW.spam_score < 70 THEN

                -- Insert into TwentyCRM workspace person table
                EXECUTE format(
                    'INSERT INTO %I.person (
                        id,
                        "nameFirstName",
                        "nameLastName",
                        "emailsPrimaryEmail",
                        "jobTitle",
                        "createdBySource",
                        "createdAt",
                        "updatedAt",
                        "deletedAt",
                        position
                    ) VALUES (
                        gen_random_uuid(),
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        NOW(),
                        NOW(),
                        NULL,
                        0
                    ) RETURNING id',
                    workspace_schema
                ) USING
                    NEW.first_name,
                    NEW.last_name,
                    NEW.email,
                    NEW.role,
                    'IMPORT'
                INTO new_person_id;

                -- Update waitlist record with sync info
                NEW.sync_to_crm := true;
                NEW.synced_at := NOW();
                NEW.crm_person_id := new_person_id;

                -- Log the sync
                RAISE NOTICE 'Synced waitlist % to CRM person %', NEW.id, new_person_id;
            END IF;

            RETURN NEW;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't fail the update
                RAISE WARNING 'Failed to sync waitlist % to CRM: %', NEW.id, SQLERRM;
                RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    # 4. Create trigger
    op.execute(
        """
        DROP TRIGGER IF EXISTS waitlist_crm_sync_trigger ON public.cms_waitlist_submissions;

        CREATE TRIGGER waitlist_crm_sync_trigger
            BEFORE UPDATE ON public.cms_waitlist_submissions
            FOR EACH ROW
            EXECUTE FUNCTION sync_waitlist_to_crm();
    """
    )

    # 5. Mark existing submissions as spam (all 28 are spam based on analysis)
    op.execute(
        """
        UPDATE public.cms_waitlist_submissions
        SET
            status = 'spam',
            spam_score = 80,
            spam_factors = jsonb_build_object(
                'gibberish_name', 40,
                'domain_mismatch', 20,
                'gibberish_content', 20,
                'reason', 'Random gibberish in all text fields - bot submission'
            )
        WHERE status = 'pending'
          AND spam_score = 0;
    """
    )

    # 6. Add comment to table
    op.execute(
        """
        COMMENT ON COLUMN public.cms_waitlist_submissions.spam_score IS
        'Spam score 0-100. <40=legitimate, 40-69=suspicious, 70+=spam';

        COMMENT ON COLUMN public.cms_waitlist_submissions.spam_factors IS
        'JSONB breakdown of spam scoring factors for transparency';

        COMMENT ON COLUMN public.cms_waitlist_submissions.sync_to_crm IS
        'Whether this submission has been synced to TwentyCRM';

        COMMENT ON COLUMN public.cms_waitlist_submissions.crm_person_id IS
        'UUID of the person record in TwentyCRM workspace';
    """
    )


def downgrade() -> None:
    """Remove spam protection and CRM sync functionality."""

    # 1. Drop trigger and function
    op.execute(
        """
        DROP TRIGGER IF EXISTS waitlist_crm_sync_trigger ON public.cms_waitlist_submissions;
        DROP FUNCTION IF EXISTS sync_waitlist_to_crm();
    """
    )

    # 2. Drop indexes
    op.execute(
        """
        DROP INDEX IF EXISTS public.idx_waitlist_status_spam;
        DROP INDEX IF EXISTS public.idx_waitlist_sync;
        DROP INDEX IF EXISTS public.idx_waitlist_email;
    """
    )

    # 3. Drop columns
    op.execute(
        """
        ALTER TABLE public.cms_waitlist_submissions
        DROP COLUMN IF EXISTS spam_score,
        DROP COLUMN IF EXISTS spam_factors,
        DROP COLUMN IF EXISTS reviewed_by,
        DROP COLUMN IF EXISTS reviewed_at,
        DROP COLUMN IF EXISTS sync_to_crm,
        DROP COLUMN IF EXISTS synced_at,
        DROP COLUMN IF EXISTS crm_person_id;
    """
    )

    # 4. Revert spam status to pending (optional - may want to keep as spam)
    op.execute(
        """
        UPDATE public.cms_waitlist_submissions
        SET status = 'pending'
        WHERE status = 'spam';
    """
    )
