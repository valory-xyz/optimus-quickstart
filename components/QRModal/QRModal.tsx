import { Modal } from "antd";
import { Dispatch, SetStateAction } from "react";
type QRModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  address: string;
};

export const QRModal = ({ open, setOpen, address }: QRModalProps) => {
  return <Modal open={open} onCancel={() => setOpen(false)} footer={null} />;
};
