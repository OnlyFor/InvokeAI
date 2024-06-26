import sqlite3

from invokeai.app.services.shared.sqlite_migrator.sqlite_migrator_common import Migration


class Migration12Callback:
    def __call__(self, cursor: sqlite3.Cursor) -> None:
        self._add_archived_col(cursor)

    def _add_archived_col(self, cursor: sqlite3.Cursor) -> None:
        """
        - Adds `archived` columns to the board table.
        """

        cursor.execute("ALTER TABLE boards ADD COLUMN archived BOOLEAN DEFAULT FALSE;")


def build_migration_12() -> Migration:
    """
    Build the migration from database version 11 to 12..

    This migration does the following:
    - Adds `archived` columns to the board table.
    """
    migration_12 = Migration(
        from_version=11,
        to_version=12,
        callback=Migration12Callback(),
    )

    return migration_12
