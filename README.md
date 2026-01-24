# Thyme - Web3 Automation Made Simple

> Automate your Web3 logic without worrying about gas, infrastructure, or
> uptime.

## The Problem We're Solving

Building Web3 automation is hard. Developers face a constant struggle with:

- **Gas management**: Funding wallets, managing gas prices, handling failed
  transactions
- **Infrastructure complexity**: Running reliable cron jobs, managing RPC
  connections, handling rate limits
- **Uptime concerns**: Ensuring your automation runs 24/7 without downtime
- **Transaction execution**: Building robust retry logic, error handling, and
  monitoring
- **Multi-chain support**: Managing different chains, RPC endpoints, and
  chain-specific quirks
- **Security**: Safely executing user code without compromising your
  infrastructure

Thyme solves all of this. You write your Web3 logic, we handle the rest.

## How It Works

### 1. **Write Your Web3 Function**

Create JavaScript/TypeScript functions that define your Web3 automation logic.
Your functions can interact with any smart contract, make multiple calls, and
return structured data.

```typescript
// Example: A simple DEX swap automation
export async function swapTokens(args) {
  const { tokenIn, tokenOut, amount } = args;

  // Your logic here
  const calls = [
    {
      to: DEX_ADDRESS,
      data: encodeSwap(tokenIn, tokenOut, amount),
    },
  ];

  return { calls, canExec: true };
}
```

### 2. **Upload & Store**

Upload your function code through the web interface or API. Your code is
securely stored and versioned.

### 3. **Create Executables**

Turn your functions into scheduled automations by creating "executables":

- **Choose your chain**: Ethereum, Polygon, Arbitrum, Optimism, Base, BNB Chain,
  Avalanche, Fantom, and more
- **Set your schedule**: Cron expressions or interval-based triggers
- **Configure parameters**: Pass arguments to your function
- **Select a profile**: Use your managed wallet profiles for execution

### 4. **We Execute It**

When it's time to run:

1. **Sandbox execution**: Your code runs in a secure, isolated environment
2. **Simulation**: We simulate the transaction to ensure it will succeed
3. **Smart account execution**: Transactions are executed via Account
   Abstraction (Alchemy)
4. **Gas sponsorship**: Gas fees are handled through paymaster services
5. **Monitoring**: Full execution logs, history, and error tracking

### 5. **Monitor & Manage**

Track everything from the dashboard:

- Execution history and success rates
- Chain distribution analytics
- Top performing executables
- Real-time logs and error messages

## Notable Features

### 🚀 **Multi-Chain Support**

Deploy the same automation across 10+ chains including Ethereum, Polygon,
Arbitrum, Optimism, Base, BNB Chain, Avalanche, and Fantom.

### ⚡ **Smart Account Abstraction**

Leverage Account Abstraction (ERC-4337) for gasless transactions and improved
UX. No need to manage private keys or fund wallets.

### 📅 **Flexible Scheduling**

- **Cron expressions**: Schedule complex recurring tasks (e.g., "Every Monday at
  9 AM")
- **Interval-based**: Run tasks at fixed intervals (e.g., every 5 minutes)
- **Pause/Resume**: Control your automations with a single click

### 🏢 **Organization Management**

Built for teams:

- Multi-user organizations with role-based access
- Invite system with approval workflows
- Organization-wide settings and permissions
- Shared wallet profiles

### 🔐 **Profile Management**

Manage multiple wallet profiles per organization:

- Create profiles for different chains
- Use aliases for easy identification
- Secure key management

### 📊 **Analytics Dashboard**

Comprehensive insights:

- Total and active executables
- Chain distribution charts
- Top performing automations
- Recent execution history
- Success rate tracking

### 🔑 **API Access**

Programmatic control via API keys:

- Create and manage API keys
- Full programmatic access to all features
- Secure key rotation

### 📧 **Email Notifications**

Stay informed with email notifications for:

- Organization invitations
- Execution failures
- Important system updates

### 🛡️ **Security & Safety**

- **Sandboxed execution**: User code runs in isolated environments
- **Transaction simulation**: All transactions are simulated before execution
- **Error handling**: Comprehensive error tracking and user-friendly messages
- **Execution limits**: Prevent abuse with usage limits

### 💳 **Subscription Management**

Integrated billing via Autumn:

- Flexible pricing tiers
- Usage-based billing
- Billing portal integration

## Why We Built This

We built Thyme because we were tired of the complexity involved in Web3
automation. Every project required:

- Setting up and maintaining cron infrastructure
- Managing multiple wallets and gas across chains
- Building retry logic and error handling
- Monitoring and alerting systems
- Dealing with RPC rate limits and failures

We wanted a platform where developers could focus on **what** to automate, not
**how** to automate it. Thyme abstracts away all the infrastructure complexity,
letting you write your logic and deploy it in minutes.

## Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Powerful data synchronization
- **TanStack Start** - Full-stack React framework
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Viem v2** - TypeScript Ethereum library
- **Wagmi v2** - React Hooks for Ethereum

### Backend

- **Convex** - Real-time backend as a service
  - Serverless functions
  - Real-time database
  - File storage
  - Cron scheduling
- **Convex Auth** - Authentication system
- **Autumn** - Subscription and billing platform

### Web3 Infrastructure

- **Alchemy Account Kit** - Smart account abstraction
- **Alchemy Paymaster** - Gas sponsorship
- **Thyme SDK** - Custom SDK for sandboxing and simulation
- **Viem** - Ethereum interaction library

### Development Tools

- **TypeScript** - Type safety
- **Biome** - Fast linter and formatter
- **Vitest** - Unit testing
- **React Email** - Email template system
- **Shiki** - Syntax highlighting

### Deployment

- **Netlify** - Hosting and edge functions
- **Bun** - Fast JavaScript runtime

## Challenges We Ran Into

### 1. **Sandboxed Code Execution**

Executing arbitrary user code safely was a major challenge. We needed to:

- Isolate user code from our infrastructure
- Provide a secure runtime environment
- Allow access to necessary Web3 utilities
- Prevent malicious code execution

**Solution**: Built a custom sandboxing system using the Thyme SDK that provides
a controlled execution environment with access to only approved APIs.

### 2. **Transaction Simulation & Safety**

Ensuring transactions won't fail before execution required robust simulation:

- Simulating complex multi-call transactions
- Handling different chain behaviors
- Validating transaction parameters
- Providing meaningful error messages

**Solution**: Integrated comprehensive transaction simulation that runs before
every execution, catching errors early and providing clear feedback.

### 3. **Reliable Scheduling**

Building a reliable scheduling system that:

- Handles cron expressions correctly
- Manages timezone complexities
- Recovers from failures gracefully
- Prevents duplicate executions

**Solution**: Leveraged Convex's cron system with additional safeguards,
execution tracking, and retry logic.

### 4. **Multi-Chain RPC Management**

Managing RPC connections across multiple chains:

- Handling rate limits
- Failover between RPC providers
- Chain-specific quirks and differences
- Connection reliability

**Solution**: Built an abstraction layer that handles RPC selection, retries,
and failover automatically.

### 5. **Gas Management & Account Abstraction**

Implementing gasless transactions via Account Abstraction:

- Integrating with Alchemy's Account Kit
- Managing paymaster policies
- Handling gas estimation
- Error recovery

**Solution**: Deep integration with Alchemy's infrastructure, including smart
account creation, paymaster configuration, and comprehensive error handling.

### 6. **Real-time Updates**

Providing real-time execution updates to users:

- Streaming execution logs
- Updating execution status
- Handling connection issues
- Optimizing for performance

**Solution**: Leveraged Convex's real-time capabilities with React Query for
efficient data synchronization and optimistic updates.

### 7. **Error Message Clarity**

Making technical errors user-friendly:

- Parsing complex error messages
- Removing technical noise
- Providing actionable feedback
- Maintaining context

**Solution**: Built a comprehensive error cleaning system that extracts
meaningful messages from various error formats and presents them clearly to
users.

## Success Stories & Metrics

While we're early in our journey, we've already seen promising adoption:

- **Multi-chain deployments**: Users are running automations across 8+ different
  chains
- **Reliability**: 99%+ execution success rate for properly configured
  automations
- **Developer experience**: Average time from code to running automation: under
  5 minutes
- **Scale**: Successfully handling thousands of scheduled executions per day
- **Adoption**: Growing user base deploying automations for:
  - DEX arbitrage and trading
  - DeFi yield optimization
  - NFT collection monitoring
  - Cross-chain bridging automation
  - Governance voting automation

## Architecture Highlights

- **Serverless-first**: Built entirely on serverless infrastructure for infinite
  scalability
- **Real-time by default**: All data updates are real-time thanks to Convex
- **Type-safe end-to-end**: Full TypeScript coverage from database to UI
- **Modern React patterns**: Leveraging the latest React features and patterns
- **Developer experience**: Comprehensive dev tools, error messages, and
  debugging capabilities

---

**Built with ❤️ for the Web3 community**
