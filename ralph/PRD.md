# Product Requirements Document (PRD)

## Project Overview

**Kings Puzzle** is an onchain puzzle game built as a Farcaster Mini App on Base. Players solve an 8x8 grid puzzle where they must place 8 kings following chess-like constraints. The game features a pay-to-play model using KINGS tokens, with prize pools distributed among solvers based on solve time. Each round requires double the round number in players (2, 4, 6, 8...), naturally inflating prize pools as the game grows.

### Problem Solved
- Creates an engaging, competitive puzzle game experience within the Farcaster ecosystem
- Incentivizes fast puzzle solving through time-weighted prize distribution
- Provides a fair, anti-cheat mechanism through admin-verified submissions

---

## User Stories

### Story 1: View Current Puzzle
**As a** player
**I want** to see the current puzzle grid with colored regions
**So that** I can understand what puzzle I need to solve

**Acceptance Criteria:**
- [ ] Display an 8x8 grid with 8 distinct colored regions (8 cells each)
- [ ] Show clear visual boundaries between regions
- [ ] Display the current round number and puzzle ID
- [ ] Show the current prize pool amount
- [ ] Show prominent player progress (e.g., "12/20 players")
- [ ] Display countdown text (e.g., "8 more players needed to win!")

### Story 2: Pay Entry Fee
**As a** player
**I want** to pay the entry fee in KINGS tokens to start playing
**So that** I can attempt to solve the puzzle and win prizes

**Acceptance Criteria:**
- [ ] Display the current round's entry fee (increases each round)
- [ ] Show formula context (e.g., "Round 5: 500 KINGS entry")
- [ ] Show my current KINGS token balance
- [ ] Provide a "Pay to Play" button that initiates the token transfer
- [ ] Handle wallet connection if not already connected
- [ ] Show transaction confirmation/loading state
- [ ] After successful payment, unlock the puzzle for solving
- [ ] Handle insufficient balance with clear error message

### Story 3: Solve the Puzzle
**As a** player
**I want** to place kings on the grid following the rules
**So that** I can solve the puzzle as quickly as possible

**Acceptance Criteria:**
- [ ] Allow tapping/clicking cells to place or remove kings
- [ ] Display placed kings clearly on the grid
- [ ] Show a running timer from when the puzzle was unlocked
- [ ] Validate placements in real-time with visual feedback:
  - [ ] Highlight rule violations (same row/column conflicts)
  - [ ] Highlight diagonal adjacency conflicts
  - [ ] Highlight region conflicts (multiple kings in same color)
- [ ] Display count of kings placed (X/8)
- [ ] Show the rules clearly for reference

### Story 4: Submit Solution
**As a** player
**I want** to submit my completed solution
**So that** my solve time is recorded and I'm eligible for prizes

**Acceptance Criteria:**
- [ ] Enable "Submit" button only when exactly 8 kings are placed
- [ ] Validate solution client-side before submitting
- [ ] Send solution and time to backend for verification
- [ ] Show loading state during verification
- [ ] On success: Display confirmation with solve time and ranking
- [ ] On failure: Show error message explaining what went wrong
- [ ] Add player to the current round's solver list

### Story 5: View Leaderboard
**As a** player
**I want** to see the current round's solver leaderboard
**So that** I can see how my time compares to others

**Acceptance Criteria:**
- [ ] Display prominent "X players left" counter above leaderboard (e.g., "4 more players needed")
- [ ] Show progress indicator (e.g., "12/20 players" with progress bar)
- [ ] Display list of solvers in the current round sorted by time
- [ ] Show each solver's Farcaster username and profile picture
- [ ] Show each solver's verified solve time
- [ ] Highlight the current user's entry if they've solved
- [ ] Show estimated prize share based on current rankings

### Story 6: Prize Distribution with Inflation
**As a** player
**I want** prizes distributed when enough players have played
**So that** fast solvers are rewarded fairly and the game grows over time

**Acceptance Criteria:**
- [ ] Round 1 requires 2 players, Round 2 requires 4, Round 3 requires 6, etc.
- [ ] Prize pool = all entry fees collected (grows with more players)
- [ ] When player threshold is reached, prizes are distributed
- [ ] Prize pool split among solvers weighted by speed (faster = more)
- [ ] Winners receive KINGS tokens directly to their wallet
- [ ] Display distribution results (who won what)
- [ ] Puzzle rotates to the next one
- [ ] Solver list resets, new round begins requiring 2 more players
- [ ] Display next round's player requirement

### Story 7: View Game History
**As a** player
**I want** to see my past game results and winnings
**So that** I can track my performance over time

**Acceptance Criteria:**
- [ ] Show list of rounds I've participated in
- [ ] Display my solve time for each round
- [ ] Show prize amount won (if any) for each round
- [ ] Show total KINGS tokens won all-time

### Story 8: Claim Test Tokens (Testnet Only)
**As a** tester
**I want** to claim free MockKINGS tokens from a faucet
**So that** I can test the game without acquiring real tokens

**Acceptance Criteria:**
- [ ] Display "Get Test Tokens" button on testnet/local environments
- [ ] Hide faucet UI completely on production/mainnet
- [ ] Allow claiming up to 10,000 tokens per transaction
- [ ] Enforce daily limit of 100,000 tokens per wallet
- [ ] Show current daily usage and remaining allowance
- [ ] Display transaction confirmation after successful claim
- [ ] Auto-refresh balance after claiming

---

## Technical Constraints

### Smart Contract Requirements (KingsGame.sol on Base)

**State Variables:**
- `currentPuzzleId` - uint256: Current puzzle being played
- `currentRound` - uint256: Current round number (starts at 1)
- `playCount` - uint256: Number of plays in current round
- `baseEntryFee` - uint256: Base fee in KINGS tokens (100 KINGS)
- `prizePool` - uint256: Accumulated entry fees for current round
- `kingsToken` - address: KINGS ERC20 token contract
- `admin` - address: Trusted backend address for verified submissions (Single EOA)
- `solvers` - mapping of addresses to solve times for current round
- `puzzles` - uint8[64][100]: 100 pre-generated puzzles stored on-chain (one byte per cell, values 0-7 for region)
- `puzzleCount` - uint256: Total number of puzzles (fixed at 100)

**Core Functions:**
- `payToPlay()` - Transfer current entry fee, receive puzzle access
- `submitResult(address player, uint256 solveTimeMs)` - Admin-only, record verified result (minimum 10 seconds enforced)
- `distributePrizes()` - Internal, called when player threshold reached. Contract pays gas (requires ETH funding). Last solver receives rounding dust.
- `refundAllPlayers()` - Internal, called when round ends with zero successful solvers
- `emergencyRefund()` - Admin-only, refunds all entry fees if round is stuck (no automatic timeout)
- `getEntryFee()` - View: returns `baseEntryFee * currentRound`
- `getPlayersNeeded()` - View: returns `currentRound * 2` (2, 4, 6, 8...)
- `getPlayersRemaining()` - View: returns `getPlayersNeeded() - playCount`
- `rotatePuzzle()` - Internal, advance to next puzzle (cycles through 100 puzzles)
- `getLeaderboard()` - View current round solvers and times
- `getPuzzle(uint256 puzzleId)` - View puzzle configuration (returns uint8[64] region assignments)
- `getRoundInfo()` - View: current round, entry fee, players needed, play count, prize pool

**Events:**
- `GameStarted(address player, uint256 puzzleId)`
- `ResultSubmitted(address player, uint256 solveTimeMs)`
- `PrizesDistributed(uint256 roundId, address[] winners, uint256[] amounts)`
- `PlayersRefunded(uint256 roundId, uint256 totalRefunded)`
- `EmergencyRefund(uint256 roundId, address triggeredBy)`
- `PuzzleRotated(uint256 newPuzzleId)`
- `RoundStarted(uint256 roundId, uint256 playersNeeded)`

### KINGS Token (Production)
- Standard ERC20 token for entry fees and prizes
- Initial supply: 1 billion tokens to deployer
- Base entry fee: 100 KINGS (scales with round: round × 100)
- No minting required - inflation from increasing players AND fees

### MockKINGS Token (Testing)
- Fake ERC20 for local development and testnets
- Anyone can mint tokens via `faucet(amount)` function
- Faucet limited to 10,000 tokens per call, 100,000 per address per day
- No approval required for game contract (auto-approved for convenience)
- Includes `devMint(address to, uint256 amount)` for test setup
- Emits `FaucetClaimed(address indexed user, uint256 amount)` event

```solidity
// MockKINGS.sol - Test Token
contract MockKINGS is ERC20 {
    mapping(address => uint256) public lastFaucetTime;
    mapping(address => uint256) public dailyFaucetAmount;
    
    function faucet(uint256 amount) external {
        require(amount <= 10_000 * 1e18, "Max 10k per claim");
        // Reset daily limit if new day
        if (block.timestamp > lastFaucetTime[msg.sender] + 1 days) {
            dailyFaucetAmount[msg.sender] = 0;
        }
        require(dailyFaucetAmount[msg.sender] + amount <= 100_000 * 1e18, "Daily limit");
        
        dailyFaucetAmount[msg.sender] += amount;
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
        emit FaucetClaimed(msg.sender, amount);
    }
    
    function devMint(address to, uint256 amount) external {
        _mint(to, amount); // No restrictions for testing
    }
}
```

### Frontend Requirements
- Farcaster Mini App compatible (uses existing provider architecture)
- Wallet connection via Wagmi (Base network)
- Real-time timer for solve tracking
- Responsive 8x8 grid UI optimized for mobile

### Backend Requirements
- Solution verification endpoint (validates king placements)
- Time verification (anti-cheat: minimum solve time threshold)
- Admin key for contract submissions
- Signed message verification for client timestamps

### Anti-Cheat Measures
- Players cannot self-report times or solutions
- Only trusted admin (single EOA) can submit verified results to contract
- Backend validates solution correctness before submitting
- Minimum solve time threshold of 10 seconds to catch bots
- Client-side timer backed by server-side verification

---

## Puzzle Generation

### Rules for Valid Puzzles
Each puzzle must have:
1. 8x8 grid divided into exactly 8 regions
2. Each region contains exactly 8 cells
3. At least one valid solution exists
4. Regions are contiguous (all cells in a region are connected)

### Puzzle Storage
- 100 puzzles stored on-chain as `uint8[64]` arrays (one byte per cell, values 0-7 for region)
- Puzzles are pre-generated and fixed at contract deployment
- Game cycles through all 100 puzzles sequentially, then repeats
- No mechanism to add more puzzles after deployment

---

## Inflation Mechanics

**Core Concept:**
Both player count AND entry fee increase each round. This compounds the inflation effect for rapidly growing prize pools.

**Player Requirement Formula:**
```
playersNeeded = roundNumber * 2
```

**Entry Fee Formula:**
```
entryFee = baseEntryFee * roundNumber
```

**Prize Pool Formula:**
```
prizePool = playersNeeded * entryFee
prizePool = (roundNumber * 2) * (baseEntryFee * roundNumber)
prizePool = baseEntryFee * roundNumber² * 2
```

**Growth Example (100 KINGS base entry fee):**
| Round | Players | Entry Fee   | Prize Pool     |
|-------|---------|-------------|----------------|
| 1     | 2       | 100 KINGS   | 200 KINGS      |
| 2     | 4       | 200 KINGS   | 800 KINGS      |
| 3     | 6       | 300 KINGS   | 1,800 KINGS    |
| 5     | 10      | 500 KINGS   | 5,000 KINGS    |
| 10    | 20      | 1,000 KINGS | 20,000 KINGS   |
| 25    | 50      | 2,500 KINGS | 125,000 KINGS  |
| 50    | 100     | 5,000 KINGS | 500,000 KINGS  |

Prize pools grow quadratically (round²) - creating exciting, ever-larger stakes as the game matures.

---

## Prize Distribution Formula

**Speed-weighted distribution:**
```
playerShare = (1 / playerTime) / sum(1 / allTimes) * prizePool
```

This rewards faster solvers proportionally. A solver twice as fast gets twice the share.

**Example (Round 10: 20 players @ 1,000 KINGS = 20,000 KINGS pool):**

If 15 of 20 players solved correctly:
- Player A: 12s → weight = 0.083 → ~18% → 3,600 KINGS
- Player B: 18s → weight = 0.056 → ~12% → 2,400 KINGS
- Player C: 25s → weight = 0.040 → ~9% → 1,800 KINGS
- ... and so on for remaining solvers

Fastest solvers get the largest shares of the pool.

---

## Out of Scope

- Multiplayer real-time racing (single-player with leaderboard only)
- Custom puzzle creation by users
- NFT rewards or achievements
- Tournament brackets
- Social features beyond Farcaster profile display
- Mobile native app (Farcaster Mini App only)

---

## Notes

### Assumptions
- Users have Farcaster accounts and wallets
- For testing: Users can claim MockKINGS via faucet
- For production: Users acquire KINGS tokens externally (swap, earn, etc.)
- Base network has sufficient throughput for game transactions
- Cloudflare Tunnel or similar used for local development

### Future Considerations
- Daily/weekly special puzzles with larger prize pools
- Streak bonuses for consecutive round participation
- Different puzzle sizes (6x6, 10x10) as game modes
- Integration with Farcaster Frames for sharing results
- Cap on maximum players per round (e.g., max 100 players)
- Alternative scaling formulas (e.g., fibonacci: 2, 3, 5, 8, 13...)

### Dependencies
- Farcaster Mini App SDK
- Wagmi/Viem for wallet interactions
- Base network RPC
- Redis for caching (existing Upstash setup)

---

## Edge Cases & Operational Details

| Scenario | Behavior |
|----------|----------|
| **Zero solvers in a round** | All players' entry fees are refunded via `refundAllPlayers()` |
| **Stuck round (not enough players)** | Admin can call `emergencyRefund()` to refund all entry fees. No automatic timeout. |
| **Prize distribution gas** | Contract pays gas (must hold ETH). Deployment should fund contract with ETH. |
| **Rounding dust from prize math** | Last solver in the distribution receives any remainder wei |
| **Minimum solve time** | 10 seconds enforced by backend. Submissions under 10s are rejected as suspicious. |
| **Puzzle cycling** | After puzzle 100, returns to puzzle 1. Puzzles are fixed at deployment. |
| **Non-solvers' entry fees** | Included in prize pool for successful solvers. Non-solvers lose their stake. |
