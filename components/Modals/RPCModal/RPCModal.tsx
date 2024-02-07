import { useModals } from "@/hooks/useModals";
import { Input, Modal, Typography } from "antd";
import { useEffect, useState } from "react";

export const RPCModal = () => {
  const { rpcModalOpen, setRpcModalOpen } = useModals();

  const [rpc, setRpc] = useState("");

  const [rpcIsLoading, setRpcIsLoading] = useState(false);
  const [rpcIsUpdating, setRpcIsUpdating] = useState(false);

  useEffect(() => {
    if (rpcModalOpen) {
      setRpcIsLoading(true);
      fetch("/api/rpc").then((r) => {
        if (r.status == 200) {
          r.json().then((json) => {
            setRpc(json.rpc);
            setRpcIsLoading(false);
          });
        }
      });
    }
  }, [rpcModalOpen]);

  const handleUpdateRpc = () => {
    if (rpcIsUpdating) return;
    setRpcIsUpdating(true);
    fetch("/api/rpc/create", {
      method: "POST",
      body: JSON.stringify({ rpc }),
    }).then((r) => {
      if (r.status == 200) {
        setRpcIsUpdating(false);
        setRpcModalOpen(false);
      }
    });
  };

  return (
    <Modal
      open={rpcModalOpen}
      onCancel={() => setRpcModalOpen(false)}
      onOk={() => {}}
      title={"RPC"}
      okText="Update"
      okButtonProps={{
        loading: rpcIsUpdating,
        disabled: rpcIsLoading || rpcIsUpdating || !rpc,
        onClick: handleUpdateRpc,
      }}
    >
      <Typography.Text>
        RPCs are the way to communicate with the blockchain.
      </Typography.Text>
      <Typography.Text>
        Here you can paste your RPC and update it.
      </Typography.Text>
      <Input
        value={rpc}
        onChange={(e) => setRpc(e.target.value)}
        disabled={rpcIsLoading}
      />
    </Modal>
  );
};
