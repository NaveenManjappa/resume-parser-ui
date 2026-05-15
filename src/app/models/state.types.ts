import { ExtractResponse } from "./extraction.types";

export type ExtractionResult =
| { status:'error',error:ExtractionError}
| { status:'success',data:ExtractResponse}

type ErrorBase = { message:string}

export type ExtractionError = ErrorBase & (
  | { category:'rate_limit',retryIn:number}
  | { category:'validation'}
  | { category:'network'}
  | { category:'server'}
);