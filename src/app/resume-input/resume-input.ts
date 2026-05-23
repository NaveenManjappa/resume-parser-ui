import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RESUME_TEXT_MAX, RESUME_TEXT_MIN } from '../models/extraction.types';
import { PdfParser } from '../pdf-parser';
import { ParseState } from '../models/state.types';
import { PdfParserError } from '../models/pdf-parser.types';

@Component({
  selector: 'app-resume-input',
  imports: [ReactiveFormsModule],
  templateUrl: './resume-input.html',
  styleUrl: './resume-input.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ResumeInput {
  private fb = inject(FormBuilder);
  private pdfParser = inject(PdfParser);
  readonly extract = output<string>();
  readonly minLength = RESUME_TEXT_MIN;
  readonly maxLength = RESUME_TEXT_MAX;

  readonly parseState = signal<ParseState>({ status:'idle'});
  
  readonly form = this.fb.group({
    resumeText: ['',[
      Validators.required,
      Validators.minLength(RESUME_TEXT_MIN),
      Validators.maxLength(RESUME_TEXT_MAX)
    ]]
  });

  showError = () => {
    const control = this.form.controls.resumeText;
    return control.invalid && (control.dirty || control.touched);
  }
  onSubmit(){
    if(this.form.invalid) return;
    this.extract.emit(this.form.controls.resumeText.value ?? '');
  }

  async onFileSelected(event:Event){
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0){
      const file = input.files[0];
      if(!file) return;
      this.parseState.set({ status:'parsing'});
      this.form.controls.resumeText.disable();
      try {
        const text = await this.pdfParser.parseFile(file);
        this.form.controls.resumeText.setValue(text);
        this.form.controls.resumeText.markAllAsDirty();
        this.parseState.set({ status:'idle'});
      } catch(error){
        const message = error instanceof PdfParserError
        ? error.message
        :'Something went wrong reading the file.';
        this.parseState.set({ status:'error',message});
      } finally {
        this.form.controls.resumeText.enable();
        input.value='';
      }
    }
  }
 
}
