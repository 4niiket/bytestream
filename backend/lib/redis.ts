import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: REDIS_URL,
});

const MAX_CACHED_VIDEOS = 5;
const CACHE_TTL_SECONDS = 300;

redisClient.on("connect", () => {
  console.log("✓ Redis Connected");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const initializeRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const getRedisClient = () => redisClient;

export const cacheVideo = async (
  videoId: number,
  videoData: unknown
): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(
      `video:${videoId}`,
      JSON.stringify(videoData),
      {
        EX: CACHE_TTL_SECONDS,
      }
    );
  } catch (err) {
    console.warn("Error caching video:", err);
  }
};

export const getCachedVideo = async (
  videoId: number
): Promise<unknown | null> => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(`video:${videoId}`);

    if (!data) return null;

    return JSON.parse(data);
  } catch (err) {
    console.warn("Error retrieving video:", err);
    return null;
  }
};

export const cacheFeed = async (
  feedData: unknown
): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(
      "feed:latest",
      JSON.stringify(feedData),
      {
        EX: CACHE_TTL_SECONDS,
      }
    );
  } catch (err) {
    console.warn("Error caching feed:", err);
  }
};

export const getCachedFeed = async (): Promise<unknown | null> => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get("feed:latest");

    if (!data) return null;

    return JSON.parse(data);
  } catch (err) {
    console.warn("Error retrieving feed:", err);
    return null;
  }
};

import { prisma } from "./prisma.js";

export const preloadVideos = async (
  videoIds: number[]
): Promise<void> => {
  try {
    if (!videoIds || videoIds.length === 0) {
      console.log("✓ Redis cache ready. No videos available to preload.");
      return;
    }

    console.log(
      `Redis cache ready. Preload requested for ${videoIds.length} video(s)...`
    );

    const videos = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      include: {
        creator: { select: { username: true } },
        codePane: true,
        _count: { select: { videoLikes: true, videoDislikes: true } },
      },
    });

    if (videos.length === 0) {
      console.log("✓ Redis cache ready. Preloaded 0 videos (database returned no matches).");
      return;
    }

    for (const video of videos) {
      const videoData = {
        ...video,
        likeCount: video._count.videoLikes,
        dislikeCount: video._count.videoDislikes,
      };
      await cacheVideo(video.id, videoData);
    }

    console.log(`✓ Successfully preloaded ${videos.length} video(s) into Redis cache`);
  } catch (err) {
    console.warn("Video preload encountered an error (non-blocking):", err instanceof Error ? err.message : err);
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    await redisClient.flushDb();
    console.log("✓ Redis cache cleared");
  } catch (err) {
    console.warn("Error clearing Redis:", err);
  }
};

process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await redisClient.quit();
  process.exit(0);
});