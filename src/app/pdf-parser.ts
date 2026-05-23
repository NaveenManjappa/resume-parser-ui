import { Injectable } from '@angular/core';
import { PdfParserError } from './models/pdf-parser.types';

@Injectable({
  providedIn: 'root',
})
export class PdfParser {
  private readonly MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  async parseFile(file: File): Promise<string> {
    this.validateFile(file);
    const buffer = await this.readAsArrayBuffer(file);
    const text = await this.extractText(buffer);
    this.validateExtractedText(text);
    return text;
  }

    private validateFile(file: File): void {
      if (file.type !== 'application/pdf') {
        throw new PdfParserError('invalid_type', 'Please upload a PDF file.');
      }
      if (file.size > this.MAX_SIZE_BYTES) {
        throw new PdfParserError('too_large', 'File size exceeds the 5MB limit.');
      }
    }

    private validateExtractedText(text: string): void {
      if(text.trim().length === 0){
        throw new PdfParserError('empty', 'No text could be extracted. The PDF may be image-based or scanned. Please ensure the PDF contains selectable text.');
      }
    }

    private async readAsArrayBuffer(file:File):Promise<ArrayBuffer>{
      try{
        return await file.arrayBuffer();
      }
      catch{
        throw new PdfParserError('parse_failed','Failed to read the file');
      }
    }

    private async extractText(buffer: ArrayBuffer): Promise<string> {
      try{
        const pdfjs = await import('pdfjs-dist');
        console.log('version',pdfjs.version);
        pdfjs.GlobalWorkerOptions.workerSrc=`https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;;
        const pdf = await pdfjs.getDocument({ data:buffer}).promise;
        const pageTexts:string[] =[];
        for(let i=1;i<=pdf.numPages;i++){
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item:any) => 'str' in item ? item.str : '')
            .join(' ');
            pageTexts.push(pageText);
        }

        return pageTexts.join('\n\n');

      } catch(error){
        if(error instanceof PdfParserError) throw error;
        throw new PdfParserError('parse_failed','Could not parse the PDF.The file may be corrupt or password protected');
      }
      
    }
}
