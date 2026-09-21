import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent `next dev` from appending its auto-managed agent-rules file —
  // this project keeps its own spec at SOKOWISE_CLAUDE.md.
  agentRules: false,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
