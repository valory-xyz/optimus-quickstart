import { SpawnScreenState } from "@/enums";
import { Button, Flex, Typography } from "antd";
import { Dispatch, SetStateAction } from "react";

export const SpawnStakingCheck = ({
  setSpawnScreenState,
  setIsStaking,
  nextPage,
}: {
  setSpawnScreenState: Dispatch<SetStateAction<SpawnScreenState>>;
  setIsStaking: Dispatch<SetStateAction<boolean>>;
  nextPage: SpawnScreenState;
}) => {
  const handleYes = () => {
    setIsStaking(true);
    setSpawnScreenState(nextPage);
  };

  const handleNo = () => {
    setIsStaking(false);
    setSpawnScreenState(nextPage);
  };

  return (
    <Flex gap={8} vertical>
      <Flex justify="center">
        <Typography.Text strong>Would you like to stake OLAS?</Typography.Text>
      </Flex>
      <Flex gap={8} justify="center">
        <Button type="primary" onClick={handleYes}>
          Yes
        </Button>
        <Button onClick={handleNo}>No</Button>
      </Flex>
    </Flex>
  );
};
