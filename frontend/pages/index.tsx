import { YourAgents } from "@/components/YourAgents/YourAgents";
import { useTab } from "@/hooks/useTab";
import { Tabs, type TabsProps } from "antd";
import Head from "next/head";

const tabs: TabsProps['items'] = [
  {
    key: "1", 
    label: "Your Agents",
    children: <YourAgents/>,
  },
  {
    key: "2", 
    label: "Marketplace",
    children: "Content of Tab Pane 2",
  }
]


export default function Home() {
  const {activeTab, setActiveTab} = useTab()
  return (
    <>
      <Head>
        <title>Olas Operate App</title>
      </Head>
      
      <Tabs items={tabs} activeKey={activeTab} onChange={(activeKey: string)=>setActiveTab(activeKey)}/>
    </>
  );
}
