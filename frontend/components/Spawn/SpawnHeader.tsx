import { Progress } from "antd";

export const SpawnHeader = () => {
    return (
        <div>
            <img src="/robot-head.png" alt="" style={{ width: 200 }} />
            <h1>Spawn your Agent</h1>
            <Progress percent={30} />
        </div>
    );
}

