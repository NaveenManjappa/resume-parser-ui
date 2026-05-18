export interface CandidateProfile {
  full_name:string | null;
  email:string | null;
  years_of_experience:number | null;
  years_of_experience_source:string[];
  skills:string[] | null;
  current_title:string | null;
  summary:string | null;
  linkedin_url:string | null;
}

export interface ExtractionMetadata {
  model_used:string | null;
  extraction_time_ms:number | null;
  prompt_tokens:number | null;
  completion_tokens:number | null;
}

export interface ExtractResponse {
  profile:CandidateProfile;
  metadata:ExtractionMetadata;
}

export const RESUME_TEXT_MIN=100;
export const RESUME_TEXT_MAX=20000;