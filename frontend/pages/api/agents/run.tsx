import { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  try {
    exec("docker run -p 1337 hello-world", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        res.status(500).json({ message: error });
      }
      res.status(200).json({ message: stdout });
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
  res.status(500).json({ message: "Failed" });
};

export default handler;
