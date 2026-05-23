import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ExtractResponse } from '../models/extraction.types';
import { Metrics } from '../metrics/metrics';
import { ResumeViewer } from "../resume-viewer/resume-viewer";

@Component({
  selector: 'app-result',
  imports: [Metrics, ResumeViewer],
  templateUrl: './result.html',
  styleUrl: './result.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Result {
  readonly activeTab = signal<'structured' | 'json'>('structured');

  readonly data = input.required<ExtractResponse>();
  readonly jsonText = computed(()=> JSON.stringify(this.data(), null, 2   ));

  readonly reset = output<void>();

  setTab(tab: 'structured' | 'json') {
    this.activeTab.set(tab);
  }
}
