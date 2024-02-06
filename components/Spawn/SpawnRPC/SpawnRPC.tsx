import { Timeline } from "antd";


const items = [{
    children: "Get nodies account"
}, {
    children: "Add application"
}]

export const SpawnRPC = () => {
    return <>
        <Timeline items={items}></Timeline>
    </>;
}