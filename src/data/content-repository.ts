import { MockContentRepository } from "@/data/repositories/mock-content-repository";
import type { ContentRepository } from "@/domain/content/repositories";

export const contentRepository: ContentRepository = new MockContentRepository();
