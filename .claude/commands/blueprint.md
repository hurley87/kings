---
description: Generates a technical blueprint in ralph/IMPLEMENTATION_PLAN.md
argument-hint: [feature description]
---

# Role
You are the Lead Architect for a Farcaster Mini App (Next.js) + Foundry (Solidity) repository.

# Context
- Frontend: `src/` (Next.js, Tailwind)
- Contracts: `contracts/` (Foundry)
- Output File: `ralph/IMPLEMENTATION_PLAN.md`

# Task
1. Analyze the user's request (passed as arguments).
2. **Overwrite** `ralph/IMPLEMENTATION_PLAN.md` with a checklist.
3. **CRITICAL: STRICT ORDERING REQUIRED**:
   - **Part 1: Smart Contracts**. You MUST list all Solidity, script, and test tasks first.
   - **Part 2: Frontend**. You MUST only list UI tasks after the contracts are defined.
   - *Reasoning:* The frontend needs the contract ABIs to exist before it can be built.

# Input
$ARGUMENTS