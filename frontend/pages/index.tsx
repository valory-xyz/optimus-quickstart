import { Marketplace } from "@/components/Marketplace/Marketplace";
import { YourAgents } from "@/components/YourAgents/YourAgents";
import { useTabs } from "@/hooks/useTabs";
import { Tabs, type TabsProps } from "antd";

const tabs: TabsProps['items'] = [
  {
    key: "1", 
    label: "Your Agents",
    children: <YourAgents/>,
  },
  {
    key: "2", 
    label: "Marketplace",
    children: <Marketplace/>,
  }
]


export default function Home() {
  const {activeTab, setActiveTab} = useTabs()
  return (
      <Tabs items={tabs} activeKey={activeTab} onChange={(activeKey: string)=>setActiveTab(activeKey)}/>
  );
}
