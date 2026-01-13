#!/bin/bash

PROMPT_FILE="ralph/PROMPT.md"
MAX_ITERATIONS=${1:-10}
RALPH_DIR="ralph"
RUNS_DIR="$RALPH_DIR/runs"
ACTIVITY_LOG="$RALPH_DIR/activity.log"

# Ensure runs directory exists
mkdir -p "$RUNS_DIR"

# Initialize activity log if it doesn't exist
if [ ! -f "$ACTIVITY_LOG" ]; then
    echo "# Activity Log" > "$ACTIVITY_LOG"
    echo "" >> "$ACTIVITY_LOG"
    echo "Timestamped log of all runs and their durations." >> "$ACTIVITY_LOG"
    echo "" >> "$ACTIVITY_LOG"
    echo "---" >> "$ACTIVITY_LOG"
    echo "" >> "$ACTIVITY_LOG"
fi

echo "🍩 Starting Ralph... (Max loops: $MAX_ITERATIONS)"

counter=0
while [ $counter -lt $MAX_ITERATIONS ]; do
    run_num=$((counter + 1))
    timestamp=$(date +"%Y%m%d-%H%M%S")
    run_id="${timestamp}-$(printf "%03d" $run_num)"
    run_log="$RUNS_DIR/run-${run_id}.log"
    run_summary="$RUNS_DIR/run-${run_id}.summary.md"
    
    echo "--- Loop #$run_num (Run ID: $run_id) ---"
    
    # Record start time
    start_time=$(date +"%Y-%m-%d %H:%M:%S")
    start_epoch=$(date +%s)
    
    # Log activity
    echo "$start_time - Run #$run_num started (ID: $run_id)" >> "$ACTIVITY_LOG"
    
    # Capture Claude output to log file
    {
        echo "Run #$run_num - $(date)"
        echo "Run ID: $run_id"
        echo "---"
        echo ""
        cat "$PROMPT_FILE" | claude --dangerously-skip-permissions
    } | tee "$run_log"
    
    # Record end time and calculate duration
    end_time=$(date +"%Y-%m-%d %H:%M:%S")
    end_epoch=$(date +%s)
    duration=$((end_epoch - start_epoch))
    
    # Log completion
    echo "$end_time - Run #$run_num completed - Duration: ${duration}s" >> "$ACTIVITY_LOG"
    
    # Generate summary
    {
        echo "# Run #$run_num Summary"
        echo ""
        echo "**Run ID**: $run_id"
        echo "**Started**: $start_time"
        echo "**Completed**: $end_time"
        echo "**Duration**: ${duration}s"
        echo ""
        echo "## Output"
        echo ""
        echo "See \`run-${run_id}.log\` for full output."
        echo ""
    } > "$run_summary"
    
    counter=$((counter + 1))
    sleep 1
done

echo "🍩 Ralph finished."
