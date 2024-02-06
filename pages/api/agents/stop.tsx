import { exec } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";

export const handler = (req: NextApiRequest, res: NextApiResponse) => {
  exec("docker stop hello-world", (error, stdout, stderr) => {});
  res.status(200).json({ message: "Stopped" });
};
