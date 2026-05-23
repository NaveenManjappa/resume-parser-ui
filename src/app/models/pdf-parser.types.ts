export type PdfParseErrorCategory = 'invalid_type' | 'too_large' | 'parse_failed' | 'empty';

export class PdfParserError extends Error {
  constructor(public category:PdfParseErrorCategory, message:string){
    super(message);
   this.name = 'PdfParserError';
  }
}