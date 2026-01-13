# Ralph's Forge

**The ultimate full-stack starter kit for Farcaster Mini Apps.**

This repository combines a production-ready Next.js frontend with a robust Foundry smart contract environment. It is designed to get you from "zero" to "deployed dApp" as fast as possible.

## Quick Start

```bash
git clone https://github.com/hurley87/ralphs-forge.git
cd ralphs-forge
```

```bash
claude "help me get set up"
```

## Architecture

This is a "Monorepo-Lite" setup. Everything lives in one place, but concerns are separated:

- `app/` (Frontend): The Next.js application, powered by the Farcaster Mini App Starter.
- `contracts/` (Backend): The Smart Contract environment, powered by LazerForge.

### Available Commands

Run these from the root directory:

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Starts the Next.js local development server. |
| `pnpm run forge:build` | Compiles your smart contracts. |
| `pnpm run forge:test` | Runs Foundry tests for your contracts. |
| `pnpm run forge:deploy` | Deploys contracts and syncs ABIs to the frontend. |
| `pnpm run ralph` | Runs the autonomous development loop (see below). |

**Note**: Check `package.json` to configure the deployment script specific to your chain.

## Ralph: Autonomous Development Loop

Ralph is an autonomous coding agent powered by Claude. It uses a two-phase planning system (PRD → Plan) and works through stories, writing code, running tests, and committing changes without human intervention.

### How It Works

1. **Write a PRD**: Create a Product Requirements Document in `ralph/PRD.md` with:
   - Project overview and goals
   - User stories with acceptance criteria
   - Technical constraints
   - Out of scope items

2. **Generate a Plan**: Use the `/blueprint` slash command in Claude Code to create an implementation plan from the PRD.
   ```bash
   /blueprint Add a voting contract with a frontend UI
   ```
   This creates a story-based task checklist in `ralph/IMPLEMENTATION_PLAN.md`.

3. **Run Ralph**: Execute the autonomous loop.
   ```bash
   pnpm run ralph        # Default: 10 iterations
   pnpm run ralph 20     # Custom: 20 iterations
   ```

Ralph will:
- Read the PRD for context and requirements
- Pick the next unchecked story from the plan
- Complete all tasks in that story before moving to the next
- Write code and run verification (`forge test` or `pnpm run lint`)
- Log progress to `ralph/progress.md`
- Record errors in `ralph/errors.log`
- Mark tasks complete and commit
- Exit and restart for the next iteration

### State Files

Ralph maintains state in the `ralph/` directory:

- `PRD.md` - Product Requirements Document (requirements & acceptance criteria)
- `IMPLEMENTATION_PLAN.md` - Story-based task plan
- `progress.md` - Append-only log of completed work
- `guardrails.md` - Lessons learned and patterns to avoid
- `activity.log` - Timestamped activity log with run durations
- `errors.log` - Record of errors and failures
- `runs/` - Per-run logs and summaries

### Key Principles

- **PRD First**: Requirements are captured before planning
- **Story-Based**: Tasks are grouped by story and completed one story at a time
- **Contracts First**: All smart contract tasks must complete before frontend tasks begin (ensures ABIs exist before frontend imports them)
- **Learning**: Ralph checks `guardrails.md` before starting and logs errors to prevent repeated failures

## Tribute & Credits

Ralph's Forge stands on the shoulders of giants. It is a remix of these open-source projects:

- **Frontend**: [Farcaster Mini App Starter](https://github.com/builders-garden/miniapp-starter) by Builders Garden.
- **Smart Contracts**: [LazerForge](https://github.com/lazertechnologies/lazerforge) by Lazer Technologies.
- **Ralph**: [How to Ralph Wiggum](https://github.com/ghuntley/how-to-ralph-wiggum) by Geoffrey Huntley.

Please support the original creators by starring their repositories!

## License

This project retains the open-source licenses of its parent components. See the LICENSE file in the root and `contracts/` directory for details.
