import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === "GET") {
    const data = fs.readFileSync("rpcs.txt");
    res.status(200).json({ rpc: data.toString() });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
    res.end();
  }
};

export default handler;
