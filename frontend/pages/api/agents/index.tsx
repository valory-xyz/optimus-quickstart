import { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const agents: any[] = [];
  res.status(200).json({ agents });
};

export default handler;
