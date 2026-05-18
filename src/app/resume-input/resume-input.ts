import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RESUME_TEXT_MAX, RESUME_TEXT_MIN } from '../models/extraction.types';

@Component({
  selector: 'app-resume-input',
  imports: [ReactiveFormsModule],
  templateUrl: './resume-input.html',
  styleUrl: './resume-input.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ResumeInput {
  private fb = inject(FormBuilder);
  readonly extract = output<string>();
  readonly minLength = RESUME_TEXT_MIN;
  readonly maxLength = RESUME_TEXT_MAX;

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
}
