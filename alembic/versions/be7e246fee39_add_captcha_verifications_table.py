"""add_captcha_verifications_table

Revision ID: be7e246fee39
Revises: 0bbd9a03d5bc
Create Date: 2026-01-24 23:55:00.000000

Adds table to track Cloudflare Turnstile CAPTCHA verifications for spam prevention.

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "be7e246fee39"
down_revision: Union[str, None] = "0bbd9a03d5bc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add CAPTCHA verifications tracking table."""

    # Create table to track CAPTCHA verifications
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS public.captcha_verifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token VARCHAR(500) NOT NULL,
            ip_address INET,
            user_agent TEXT,
            success BOOLEAN NOT NULL,
            error_codes TEXT[],
            challenge_ts TIMESTAMP WITH TIME ZONE,
            hostname VARCHAR(255),
            action VARCHAR(100),
            cdata TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
    """
    )

    # Add indexes for common queries
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_captcha_ip_created
        ON public.captcha_verifications(ip_address, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_captcha_success_created
        ON public.captcha_verifications(success, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_captcha_token
        ON public.captcha_verifications(token);
    """
    )

    # Add comments
    op.execute(
        """
        COMMENT ON TABLE public.captcha_verifications IS
        'Tracks Cloudflare Turnstile CAPTCHA verification attempts for spam prevention and rate limiting';

        COMMENT ON COLUMN public.captcha_verifications.token IS
        'Turnstile response token from client';

        COMMENT ON COLUMN public.captcha_verifications.success IS
        'Whether the CAPTCHA verification was successful';

        COMMENT ON COLUMN public.captcha_verifications.error_codes IS
        'Array of error codes if verification failed';

        COMMENT ON COLUMN public.captcha_verifications.challenge_ts IS
        'Timestamp when the challenge was solved';

        COMMENT ON COLUMN public.captcha_verifications.metadata IS
        'Additional metadata from Turnstile response';
    """
    )


def downgrade() -> None:
    """Remove CAPTCHA verifications table."""

    op.execute(
        """
        DROP TABLE IF EXISTS public.captcha_verifications CASCADE;
    """
    )
