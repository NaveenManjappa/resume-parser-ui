import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExtractionState } from './models/state.types';
import { ExtractionService } from './extraction';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
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
    .subscribe(result=>this.extractionState.set(result));
  }

  retry(){
    if(this.resumeText){
      this.extract(this.resumeText);
    }
  }
  
}
