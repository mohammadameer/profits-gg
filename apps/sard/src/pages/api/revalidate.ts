import { NextApiRequest, NextApiResponse } from "next";

export default async function revalidate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   if (req.query.secret !== process.env.REVALIDATE_SECRET) {
  //     return res.status(401).send("Unauthorized");
  //   }

  try {
    await res.revalidate("/");
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Error revalidating");
  }
}
