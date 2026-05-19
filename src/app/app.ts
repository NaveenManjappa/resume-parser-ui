import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExtractionState } from './models/state.types';
import { ExtractionService } from './extraction';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResumeInput } from "./resume-input/resume-input";
import { Loading } from './loading/loading';
import { Error } from './error/error';


@Component({
  selector: 'app-root',
  imports: [FormsModule, ResumeInput,Loading,Error],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly title = signal('Resume Parser');
  readonly extractionState =signal<ExtractionState>({status:'idle'});
  private extractionService = inject(ExtractionService);
  resumeText = '';
  private destroyRef=inject(DestroyRef)
  
  extract(text:string){
    this.resumeText = text;
    this.extractionState.set({status:'loading',startedAt:Date.now()});
     
    this.extractionService.extract(this.resumeText)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(result=>{
      console.log(result);
      this.extractionState.set(result);
      console.log(this.extractionState());
  });
  }

  retry(){
    if(this.resumeText){
      this.extract(this.resumeText);
    }
  }

   stringify(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
  
}
