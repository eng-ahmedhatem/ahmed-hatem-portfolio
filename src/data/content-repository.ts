import { ApiContentRepository } from "@/data/repositories/api-content-repository";
import { MockContentRepository } from "@/data/repositories/mock-content-repository";
import type { ContentRepository } from "@/domain/content/repositories";

export const contentRepository: ContentRepository =
  process.env.CONTENT_REPOSITORY === "api"
    ? new ApiContentRepository()
    : new MockContentRepository();
