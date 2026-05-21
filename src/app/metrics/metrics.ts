import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ExtractionMetadata } from '../models/extraction.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics',
  imports: [CommonModule],
  templateUrl: './metrics.html',
  styleUrl: './metrics.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Metrics {
  readonly metadata = input.required<ExtractionMetadata>();
  readonly timeDisplay = computed(() => {
    const ms = this.metadata().extraction_time_ms;
    if(ms === null) return '-';
    if(ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  });
  
}
