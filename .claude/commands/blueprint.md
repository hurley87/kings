# Generate Implementation Plan from PRD

Read `ralph/PRD.md` and generate a story-based implementation plan in `ralph/IMPLEMENTATION_PLAN.md`.

## Instructions

1. Read `ralph/PRD.md` to understand the project requirements, user stories, and acceptance criteria.

2. Read `ralph/PROMPT.md` to understand the planning principles and workflow constraints.

3. Generate an implementation plan in `ralph/IMPLEMENTATION_PLAN.md` that:
   - Groups tasks by user story from the PRD
   - Follows the "Contracts First" principle (all contract tasks before frontend tasks)
   - Uses concise task descriptions (short action phrases, not paragraphs)
   - Breaks down each story's acceptance criteria into specific, actionable tasks
   - Includes an "Unresolved Questions" section for any ambiguities found in the PRD

4. Format the plan as:
   ```markdown
   # Implementation Plan
   
   This plan is derived from `ralph/PRD.md`. Tasks are grouped by story and should be completed one story at a time.
   
   ## Story 1: [Story Name from PRD]
   - [ ] Task 1.1: [Concise description]
   - [ ] Task 1.2: [Concise description]
   
   ## Story 2: [Story Name from PRD]
   - [ ] Task 2.1: [Concise description]
   ...
   
   ---
   
   **Note**: Always complete all Contract tasks before starting Frontend tasks.
   
   ## Unresolved Questions
   
   [List any ambiguities or decisions needed before implementation]
   ```

5. Write the complete plan to `ralph/IMPLEMENTATION_PLAN.md`, replacing any existing content.

## Planning Principles (from PROMPT.md)

- **Concise tasks**: Write tasks as short action phrases, not paragraphs. Sacrifice grammar for brevity.
- **Surface unknowns**: If requirements are ambiguous, append questions to `ralph/questions.md` before proceeding.
- **One decision per task**: Break multi-decision work into separate tasks.
- **Contracts First**: All smart contract tasks must complete before frontend tasks begin (ensures ABIs exist before frontend imports them).
