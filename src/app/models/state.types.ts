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

export type ExtractionState =
| { status:'idle'}
| { status:'loading',startedAt:number }
| { status:'success', data:ExtractResponse}
| { status:'error', error:ExtractionError}

export type ParseState = 
| { status:'idle'}
| { status:'parsing'}
| { status:'error', message:string}

