# Implementation Plan: Kings Puzzle Game

This plan implements the Kings Puzzle game as specified in the PRD. The game is an 8x8 grid puzzle where players place 8 kings following chess-like constraints, with KINGS token entry fees and speed-weighted prize distribution.

---

## Part 1: Smart Contracts

### 1.1 KINGS Token Contract
- [ ] Create `contracts/src/KingsToken.sol` - Production ERC20 token
  - [ ] Standard ERC20 with 18 decimals, name "KINGS", symbol "KINGS"
  - [ ] Initial supply of 1 billion tokens minted to deployer
  - [ ] No additional minting functions (fixed supply)

### 1.2 MockKINGS Token Contract (Testing)
- [ ] Create `contracts/src/MockKingsToken.sol` - Test faucet token
  - [ ] ERC20 with faucet function for testnet/local use
  - [ ] `faucet(uint256 amount)` - Max 10,000 tokens per claim
  - [ ] Daily limit of 100,000 tokens per address
  - [ ] `devMint(address to, uint256 amount)` - No restrictions for test setup
  - [ ] Track `lastFaucetTime` and `dailyFaucetAmount` per address
  - [ ] Emit `FaucetClaimed(address indexed user, uint256 amount)` event

### 1.3 Puzzle Generator Script
- [ ] Create `contracts/script/GeneratePuzzles.s.sol` - Generate 100 valid puzzles
  - [ ] Each puzzle: 8x8 grid with 8 contiguous regions of 8 cells each
  - [ ] Ensure each puzzle has at least one valid solution
  - [ ] Output puzzles as `uint8[64]` arrays (values 0-7 for region)
  - [ ] Store puzzles in a JSON file for contract initialization

### 1.4 KingsGame Contract
- [ ] Create `contracts/src/KingsGame.sol` - Main game contract
  - [ ] State variables:
    - [ ] `currentPuzzleId` (uint256)
    - [ ] `currentRound` (uint256, starts at 1)
    - [ ] `playCount` (uint256)
    - [ ] `baseEntryFee` (uint256, 100 KINGS = 100e18)
    - [ ] `prizePool` (uint256)
    - [ ] `kingsToken` (IERC20 address)
    - [ ] `admin` (address)
    - [ ] `solvers` mapping (address => SolverInfo struct with time, paid status)
    - [ ] `solverAddresses` array for iteration
    - [ ] `puzzles` (uint8[64][100] pre-generated puzzles)
    - [ ] `puzzleCount` constant (100)
  - [ ] Constructor:
    - [ ] Accept KINGS token address and admin address
    - [ ] Initialize 100 puzzles from deployment data
    - [ ] Set currentRound = 1, currentPuzzleId = 0
  - [ ] Core functions:
    - [ ] `payToPlay()` - Transfer entry fee, emit GameStarted event
    - [ ] `submitResult(address player, uint256 solveTimeMs)` - Admin-only, record result
    - [ ] `distributePrizes()` - Internal, speed-weighted distribution
    - [ ] `refundAllPlayers()` - Internal, refund when zero solvers
    - [ ] `emergencyRefund()` - Admin-only emergency refund
    - [ ] `rotatePuzzle()` - Internal, advance to next puzzle
  - [ ] View functions:
    - [ ] `getEntryFee()` returns baseEntryFee * currentRound
    - [ ] `getPlayersNeeded()` returns currentRound * 2
    - [ ] `getPlayersRemaining()` returns getPlayersNeeded() - playCount
    - [ ] `getPuzzle(uint256 puzzleId)` returns uint8[64] region array
    - [ ] `getCurrentPuzzle()` returns current puzzle regions
    - [ ] `getRoundInfo()` returns (round, entryFee, playersNeeded, playCount, prizePool)
    - [ ] `getLeaderboard()` returns solvers array with addresses and times
    - [ ] `hasPaid(address player)` returns bool
    - [ ] `getSolverTime(address player)` returns uint256
  - [ ] Events:
    - [ ] `GameStarted(address indexed player, uint256 puzzleId)`
    - [ ] `ResultSubmitted(address indexed player, uint256 solveTimeMs)`
    - [ ] `PrizesDistributed(uint256 indexed roundId, address[] winners, uint256[] amounts)`
    - [ ] `PlayersRefunded(uint256 indexed roundId, uint256 totalRefunded)`
    - [ ] `EmergencyRefund(uint256 indexed roundId, address triggeredBy)`
    - [ ] `PuzzleRotated(uint256 newPuzzleId)`
    - [ ] `RoundStarted(uint256 indexed roundId, uint256 playersNeeded)`
  - [ ] Prize distribution logic:
    - [ ] Calculate weight for each solver as 1/solveTime
    - [ ] Distribute proportionally: playerShare = (1/time) / sum(1/allTimes) * prizePool
    - [ ] Last solver receives rounding dust
    - [ ] Transfer KINGS tokens to winners

### 1.5 Contract Tests
- [ ] Create `contracts/test/KingsToken.t.sol`
  - [ ] Test initial supply minted to deployer
  - [ ] Test standard ERC20 operations (transfer, approve, transferFrom)

- [ ] Create `contracts/test/MockKingsToken.t.sol`
  - [ ] Test faucet claims up to 10,000 tokens
  - [ ] Test daily limit of 100,000 tokens
  - [ ] Test daily limit reset after 24 hours
  - [ ] Test devMint has no restrictions

- [ ] Create `contracts/test/KingsGame.t.sol`
  - [ ] Test `payToPlay()` - correct fee transferred, event emitted
  - [ ] Test `payToPlay()` - revert if already paid
  - [ ] Test `payToPlay()` - revert if insufficient balance
  - [ ] Test `getEntryFee()` - scales with round number
  - [ ] Test `getPlayersNeeded()` - returns round * 2
  - [ ] Test `submitResult()` - only admin can call
  - [ ] Test `submitResult()` - rejects times under 10 seconds
  - [ ] Test `submitResult()` - records solver time correctly
  - [ ] Test prize distribution - speed-weighted calculation
  - [ ] Test prize distribution - triggers at player threshold
  - [ ] Test prize distribution - last solver gets dust
  - [ ] Test `refundAllPlayers()` - refunds when zero solvers
  - [ ] Test `emergencyRefund()` - only admin, refunds all
  - [ ] Test `rotatePuzzle()` - cycles through 100 puzzles
  - [ ] Test `getPuzzle()` - returns correct region array
  - [ ] Test `getLeaderboard()` - returns sorted solver list
  - [ ] Test round progression - increments after distribution

### 1.6 Deployment Scripts
- [ ] Create `contracts/script/DeployKingsToken.s.sol`
  - [ ] Deploy KingsToken to mainnet/testnet
  - [ ] Record deployed address

- [ ] Create `contracts/script/DeployMockKingsToken.s.sol`
  - [ ] Deploy MockKingsToken for testnet/local

- [ ] Create `contracts/script/DeployKingsGame.s.sol`
  - [ ] Deploy KingsGame with token address and admin
  - [ ] Initialize with 100 puzzles
  - [ ] Fund contract with ETH for gas

- [ ] Update `pnpm run forge:deploy` to sync ABIs to frontend

---

## Part 2: Frontend

### 2.1 Contract Integration
- [ ] Create `lib/contracts/kings-game.ts`
  - [ ] Export contract address constants per chain (Base, Base Sepolia)
  - [ ] Export KingsGame ABI
  - [ ] Export KingsToken ABI
  - [ ] Export MockKingsToken ABI

### 2.2 Game Hooks
- [ ] Create `hooks/use-game-state.ts`
  - [ ] Fetch current round info (round, entry fee, players needed, play count, prize pool)
  - [ ] Fetch current puzzle regions
  - [ ] Fetch leaderboard data
  - [ ] Use `useCachedContractRead` pattern with short TTL
  - [ ] Auto-refresh on relevant events

- [ ] Create `hooks/use-player-state.ts`
  - [ ] Check if current user has paid for this round
  - [ ] Get user's solve time if submitted
  - [ ] Get user's KINGS token balance

- [ ] Create `hooks/use-pay-to-play.ts`
  - [ ] Execute token approval if needed
  - [ ] Call `payToPlay()` contract function
  - [ ] Handle transaction states (pending, success, error)
  - [ ] Invalidate game state cache on success

- [ ] Create `hooks/use-submit-solution.ts`
  - [ ] POST solution to backend API
  - [ ] Handle verification response
  - [ ] Invalidate leaderboard cache on success

- [ ] Create `hooks/use-faucet.ts`
  - [ ] Call MockKingsToken `faucet()` function
  - [ ] Track remaining daily allowance
  - [ ] Only enabled on testnet/local

### 2.3 API Routes
- [ ] Create `app/api/game/puzzle/route.ts`
  - [ ] GET: Return current puzzle ID and region grid
  - [ ] Read from contract via cached read

- [ ] Create `app/api/game/round-info/route.ts`
  - [ ] GET: Return current round, entry fee, players needed, play count, prize pool
  - [ ] Read from contract via cached read

- [ ] Create `app/api/game/leaderboard/route.ts`
  - [ ] GET: Return current round solvers with times and Farcaster profiles
  - [ ] Fetch solver addresses from contract
  - [ ] Batch fetch Farcaster profiles from Neynar

- [ ] Create `app/api/game/submit-solution/route.ts`
  - [ ] POST: Validate solution correctness
    - [ ] Verify exactly 8 kings placed
    - [ ] Verify no two kings in same row or column
    - [ ] Verify no two kings diagonally adjacent
    - [ ] Verify exactly one king per region
  - [ ] Verify solve time >= 10 seconds
  - [ ] Submit verified result to contract via admin key
  - [ ] Return success with solve time and ranking

- [ ] Create `app/api/game/history/route.ts`
  - [ ] GET: Return user's past rounds (protected route)
  - [ ] Query contract events for player's participation
  - [ ] Include solve times and prize amounts

- [ ] Create `app/api/game/start/route.ts`
  - [ ] POST: Record puzzle start time in Redis
  - [ ] Used for server-side time verification

### 2.4 Game Context
- [ ] Create `contexts/game-context.tsx`
  - [ ] Provide current game state to components
  - [ ] Manage puzzle start timestamp (Redis-backed)
  - [ ] Track local timer state
  - [ ] Manage placed kings array
  - [ ] Provide validation feedback state

### 2.5 Puzzle Grid Component
- [ ] Create `components/game/PuzzleGrid.tsx`
  - [ ] Render 8x8 grid with colored region backgrounds
  - [ ] Display 8 distinct colors for regions
  - [ ] Show clear visual boundaries between regions
  - [ ] Support interactive cell tap/click to place/remove kings
  - [ ] Display king icons on placed cells
  - [ ] Highlight conflicts in real-time:
    - [ ] Same row/column violations (red border)
    - [ ] Diagonal adjacency conflicts (orange border)
    - [ ] Same region conflicts (yellow border)
  - [ ] Show king count (X/8)
  - [ ] Disable interaction before payment
  - [ ] Responsive design for mobile (touch-friendly)

### 2.6 Game Timer Component
- [ ] Create `components/game/GameTimer.tsx`
  - [ ] Display running timer from puzzle unlock
  - [ ] Format as MM:SS.ms
  - [ ] Stop timer on solution submit
  - [ ] Visual emphasis on time (competitive element)

### 2.7 Round Info Component
- [ ] Create `components/game/RoundInfo.tsx`
  - [ ] Display current round number
  - [ ] Show entry fee for current round
  - [ ] Show prize pool amount
  - [ ] Display player progress (X/Y players)
  - [ ] Show countdown text ("N more players needed")
  - [ ] Progress bar visualization

### 2.8 Pay to Play Component
- [ ] Create `components/game/PayToPlay.tsx`
  - [ ] Display entry fee amount
  - [ ] Show user's KINGS balance
  - [ ] "Pay to Play" button with loading states
  - [ ] Handle wallet connection if needed
  - [ ] Show transaction confirmation
  - [ ] Error handling for insufficient balance
  - [ ] Disabled state after payment

### 2.9 Submit Solution Component
- [ ] Create `components/game/SubmitSolution.tsx`
  - [ ] "Submit" button (disabled until 8 kings placed)
  - [ ] Client-side validation before submit
  - [ ] Loading state during verification
  - [ ] Success message with solve time
  - [ ] Error message on failure

### 2.10 Leaderboard Component
- [ ] Create `components/game/Leaderboard.tsx`
  - [ ] Display "X players left" counter prominently
  - [ ] Show progress bar (current/needed players)
  - [ ] List solvers sorted by solve time (fastest first)
  - [ ] Show Farcaster username and profile picture
  - [ ] Display verified solve time
  - [ ] Highlight current user's entry
  - [ ] Show estimated prize share based on ranking

### 2.11 Game Rules Component
- [ ] Create `components/game/GameRules.tsx`
  - [ ] Display placement rules clearly
  - [ ] Show example valid/invalid placements
  - [ ] Collapsible/expandable for mobile

### 2.12 Game History Component
- [ ] Create `components/game/GameHistory.tsx`
  - [ ] List past rounds participated
  - [ ] Show solve time per round
  - [ ] Show prize won per round
  - [ ] Display total KINGS won all-time

### 2.13 Faucet Component (Testnet Only)
- [ ] Create `components/game/Faucet.tsx`
  - [ ] "Get Test Tokens" button
  - [ ] Input for amount (max 10,000)
  - [ ] Show daily usage and remaining allowance
  - [ ] Transaction confirmation display
  - [ ] Auto-refresh balance after claim
  - [ ] Hidden on production/mainnet

### 2.14 Main Game Page
- [ ] Create `components/pages/game/index.tsx`
  - [ ] Compose all game components
  - [ ] Layout: Round info at top, puzzle grid center, controls below
  - [ ] Show leaderboard alongside or below grid
  - [ ] Conditional rendering based on game state:
    - [ ] Not paid: Show PayToPlay + disabled grid
    - [ ] Paid, not solved: Show active grid + timer
    - [ ] Solved: Show result + leaderboard
  - [ ] Mobile-responsive layout

- [ ] Update `app/page.tsx` to render game page
  - [ ] Replace or extend HomePage with game interface
  - [ ] Maintain sign-in flow

### 2.15 Environment Configuration
- [ ] Update `lib/env.ts`
  - [ ] Add `GAME_ADMIN_PRIVATE_KEY` server variable
  - [ ] Add `NEXT_PUBLIC_KINGS_GAME_ADDRESS` client variable
  - [ ] Add `NEXT_PUBLIC_KINGS_TOKEN_ADDRESS` client variable

- [ ] Update `.env.example`
  - [ ] Document new environment variables

### 2.16 Styling
- [ ] Define color palette for 8 regions in `tailwind.config.ts`
  - [ ] 8 distinct, accessible colors
  - [ ] Consistent with overall design

- [ ] Add game-specific styles
  - [ ] Grid cell sizing for mobile
  - [ ] King icon styling
  - [ ] Conflict highlight animations

---

## Verification Checklist

Before marking implementation complete:

- [ ] All contract tests pass (`pnpm run forge:test`)
- [ ] Frontend builds without errors (`pnpm run build`)
- [ ] ESLint passes (`pnpm run lint`)
- [ ] Game flow works end-to-end on local testnet:
  - [ ] User can claim test tokens from faucet
  - [ ] User can pay entry fee
  - [ ] User can solve puzzle and submit
  - [ ] Leaderboard updates correctly
  - [ ] Prize distribution triggers at threshold
- [ ] Mobile UI is responsive in Farcaster Mini App preview
- [ ] Safe area insets respected on mobile
