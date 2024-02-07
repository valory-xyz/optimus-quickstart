import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === "GET") {
    fs.readFile("rpcs.txt", (err, data) => {
      if (err) {
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        res.status(200).json({ rpc: data.toString() });
      }
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
  res.end();
};

export default handler;
