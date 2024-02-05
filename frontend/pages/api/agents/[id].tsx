import { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const agent = {};
  res.status(200).json({ agent });
};

export default handler;
