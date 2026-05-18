import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Loading {
  readonly startedAt = input.required<number>();
  private elapsed = signal(0);
  
  constructor() {
    const intervalId = setInterval(() => {      
      this.elapsed.set(Date.now() - this.startedAt());
    },250);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalId));
}

  readonly message = computed(() => {
    const seconds = this.elapsed() / 1000;
    if (seconds < 2) {
      return 'Extracting ...';
    } else if (seconds < 5) {
      return 'Waking up the server...';
    } else {
      return 'Almost there - first request take take a few seconds...';
    }
  });


}
