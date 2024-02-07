import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;
  if (method === "POST") {
    const { rpc } = JSON.parse(body);
    fs.writeFile("rpcs.txt", rpc, (err) => {
      if (err) {
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        res.status(200).json({ message: "Success" });
      }
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
  res.end();
};

export default handler;
