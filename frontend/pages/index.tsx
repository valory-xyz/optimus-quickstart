import { Layout } from '@/components/Layout/Layout';
import { Marketplace } from '@/components/Marketplace/Marketplace';
import { YourAgents } from '@/components/YourAgents/YourAgents';
import { Tab } from '@/enums';
import { useTabs } from '@/hooks/useTabs';
import { Tabs, type TabsProps } from 'antd';

const tabs: TabsProps['items'] = [
  {
    key: Tab.YOUR_AGENTS,
    label: 'Your Agents',
    children: <YourAgents />,
  },
  {
    key: Tab.MARKETPLACE,
    label: 'Marketplace',
    children: <Marketplace />,
  },
];

export default function Home() {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <Layout>
      <Tabs
        items={tabs}
        centered
        activeKey={activeTab}
        onChange={setActiveTab}
      />
    </Layout>
  );
}
