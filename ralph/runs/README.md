# Run Logs

This directory contains logs and summaries for each run of the autonomous development loop.

## File Naming

- `run-{RUN_ID}.log` - Raw output from Claude for this run
- `run-{RUN_ID}.summary.md` - Summary of what was accomplished in this run

## Run ID Format

Run IDs are generated as: `{TIMESTAMP}-{COUNTER}` where:
- `{TIMESTAMP}` is the start time in ISO format (YYYYMMDD-HHMMSS)
- `{COUNTER}` is the sequential run number

Example: `run-20260113-103045-001.log`
