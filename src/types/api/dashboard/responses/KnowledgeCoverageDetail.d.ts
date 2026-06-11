/** GET /dashboard/knowledge-coverage */
interface KnowledgeCoverageDetail {
  categories: CategoryDetail[];
  most_fragile: string | null;
}
