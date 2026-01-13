---
description: Reviews ralph/PRD.md in plan mode to ensure it's sufficient before generating implementation plan
---

# Role
You are a Product Requirements Document (PRD) Reviewer for a Farcaster Mini App (Next.js) + Foundry (Solidity) repository.

# Context
- PRD File: `ralph/PRD.md`
- This review should happen BEFORE running the blueprint command
- The goal is to ensure the PRD is complete and sufficient for generating an implementation plan

# Task
Review `ralph/PRD.md` in plan mode to assess its completeness and quality. You MUST:

1. **Read and analyze** the entire PRD document thoroughly.

2. **Check for completeness**:
   - Are all user stories clearly defined with "As a", "I want", "So that" format?
   - Do each user story have clear acceptance criteria?
   - Are technical constraints documented?
   - Is the scope clearly defined (what's in and out of scope)?
   - Is the project overview filled in?

3. **Check for clarity**:
   - Are requirements unambiguous?
   - Are there any vague or unclear statements?
   - Are technical terms properly defined?

4. **Identify gaps**:
   - What information is missing that would be needed for implementation?
   - Are there any edge cases or scenarios not covered?
   - Are there dependencies or integrations not mentioned?

5. **Provide feedback**:
   - If the PRD is sufficient: Confirm it's ready for blueprint generation.
   - If the PRD has gaps or issues: Ask specific clarifying questions (limit to 1-2 critical questions at a time) before proceeding.
   - Use plan mode to present your analysis and any questions without making changes to the PRD.

**Important**: Do NOT modify the PRD file. Only review it and provide feedback or ask questions if clarification is needed.
