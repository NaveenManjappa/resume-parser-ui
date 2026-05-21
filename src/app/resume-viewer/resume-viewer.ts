import { Component, input } from '@angular/core';
import { CandidateProfile } from '../models/extraction.types';

@Component({
  selector: 'app-resume-viewer',
  imports: [],
  templateUrl: './resume-viewer.html',
  styleUrl: './resume-viewer.css',
})
export class ResumeViewer {
  readonly profile = input.required<CandidateProfile>();  
 ngOnInit(): void {
    console.log('ResumeViewer initialized with profile:', this.profile());
  }
}
