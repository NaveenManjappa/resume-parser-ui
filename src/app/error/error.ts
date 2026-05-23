import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { ExtractionError } from '../models/state.types';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error {
  readonly error = input.required<ExtractionError>();
  readonly retry = output<void>();
  readonly reset = output<void>();
  readonly elapsed = signal(0);

  constructor() {
    const intervalId = setInterval(() => {
      this.elapsed.set(this.elapsed() + 1);
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalId));
  }

  readonly secondsRemaining = computed(() => {
    const err =this.error();
    if(err.category !== 'rate_limit') return 0;
    return Math.max(0, err.retryIn - this.elapsed());
  })
  
readonly canRetry = computed(() => {
  const err = this.error();
  if(err.category === 'rate_limit'){
    return this.secondsRemaining() <= 0;
  }
  return true;
})

  onRetry() {
    if(this.canRetry()){
        this.retry.emit();
    }
       
  }
}
