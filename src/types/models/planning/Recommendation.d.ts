interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: number;
  title: string;
  detail: string;
  impact_preview?: RecommendationImpactPreview;
}
