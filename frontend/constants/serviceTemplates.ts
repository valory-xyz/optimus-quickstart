import { ServiceTemplate } from '@/client';

export const serviceTemplates: ServiceTemplate[] = [
  {
    name: 'Trader Agent',
    hash: 'bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a',
    description: 'Trader agent for omen prediction markets',
    image:
      'https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75',
    configuration: {
      nft: 'bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq',
      agent_id: 14,
      threshold: 1,
      use_staking: false,
      cost_of_bond: 10000000000000000,
      olas_cost_of_bond: 10000000000000000000,
      olas_required_to_stake: 10000000000000000000,
      fund_requirements: {
        agent: 0.1,
        safe: 0.5,
      },
    },
  },
];
