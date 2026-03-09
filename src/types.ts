export interface Project {
  id: number;
  title: string;
  year: string;
  category: string;
  material?: string;
  technique?: string;
  concept?: string;
  mainImage: string;
  conceptImage?: string;
  researchImage1?: string;
  researchImage2?: string;
  processImage1?: string;
  processImage2?: string;
  resultImage: string;
  researchText?: string;
  processText?: string;
  gallery?: string[];
}

export type Category = "All" | "Textile" | "Drawing" | "Photography";
