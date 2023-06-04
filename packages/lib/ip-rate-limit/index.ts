import type { CountFn } from "./rate-limit";
import { initRateLimit } from "./rate-limit";
import { upstashRest } from "./upstash";

export default function getIP(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0] : "127.0.0.1";
}

export const ipRateLimit = initRateLimit(
  (
    request,
    id = `ip:${getIP(request)}`,
    limit = 1,
    timeframe = 60 * 60 * 24 * 1, // 1 day
  ) => ({
    id,
    count: increment,
    limit,
    timeframe,
  }),
);

const increment: CountFn = async ({ response, key, timeframe }) => {
  // Latency logging
  const start = Date.now();

  const results = await upstashRest(
    [
      ["INCR", key],
      ["EXPIRE", key, timeframe],
    ],
    { pipeline: true },
  );

  // Temporal logging
  const latency = Date.now() - start;
  response.headers.set("x-upstash-latency", `${latency}`);

  return results[0].result;
};
