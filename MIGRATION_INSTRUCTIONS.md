# Database Migration Instructions

## Adding Status Field to Reports

To add the `status` field to the reports table, run the following command from the backend directory:

```bash
cd backend
python add_status_to_reports.py
```

This will add a `status` column to the `reports` table with a default value of "In Process".

## Alternative: Manual SQL

If you prefer to run the migration manually, execute this SQL:

```sql
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'In Process';
```

## Verifying the Migration

After running the migration, you can verify it by checking the reports table structure in your database.
