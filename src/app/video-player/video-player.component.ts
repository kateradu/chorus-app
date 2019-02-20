import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import Transcript from './transcript.model';
import { VideoService } from './video.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

  private baseUrl: string = 'https://static.chorus.ai/api';
  private id: string;
  private videoSource: string;
  private transcriptData$: Observable<Transcript[]>;
  private transcript: Transcript[] = null;
  private speakerColors: any[];
  private videoForm: FormGroup;
  public showingVideo: boolean = false;
  public paddingTop: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private videoService: VideoService
  ) { }

  ngOnInit() {
    const idParam: Observable<string> = this.route.queryParamMap.pipe(
      map(params => params.get('id'))
    );
    this.videoForm = new FormGroup({
      id: new FormControl(null, { validators: [Validators.required], updateOn: 'blur' })
    });
    this.paddingTop = '20vh';
    idParam.subscribe(id => {
      this.id = id;
      if (id) {
        this.loadContent(id);
      }
    });
    this.videoForm.patchValue({id: this.id});
  }

  loadContent(id: string): void {
    this.videoSource = `${this.baseUrl}/${id}.mp4`;
    this.transcriptData$ = this.videoService.getTranscript(id);
    this.transcriptData$.subscribe(data => {
      //console.log('transcript data', data);
      let sorted = this.sortByTime(data);
      this.speakerColors = this.getSpeakerColors(data);
      this.transcript = this.groupSpeakers(sorted);
      this.showingVideo = true;
      this.paddingTop = '5vh';
    });
  }

  /* Sort the transcript JSON data by the `time` property (number) */
  sortByTime(data: Transcript[]): Transcript[] {
    return data.sort((a,b) => (a.time - b.time));
  }

  getSpeakerColors(data: Transcript[]): any[] {
    const fuchsia = { hex: '#EE6EFF', rgba: 'rgba(238,110,255,.1)' };
    const turquoise = { hex: '#00A7D1', rgba: 'rgba(0,167,209,.1)' };
    const teal = { hex: '#2BCABD', rgba: 'rgba(43,202,189,.1)' };
    const red = { hex: '#cc0000', rgba: 'rgba(204,0,0,.1)'};
    const colorArray = [fuchsia, turquoise, teal, red];
    let colorIndex = 0;
    let speakerColors = [];

    /* Set a color for each speaker */
    data.forEach(remark => {
      if (!speakerColors[remark.speaker]) {
        speakerColors[remark.speaker] = {
          'background-color': colorArray[colorIndex].rgba,
          'border-color': colorArray[colorIndex].hex
        };
        /* Cycle the colors */
        colorIndex = (colorIndex + 1) % colorArray.length;
      }
    });
    return speakerColors;
  }

  /* Set `new` property on remarks if the speaker changes from the previous remark */
  groupSpeakers(data: Transcript[]): Transcript[] {
    let speaker: string = null;
    data.forEach(remark => {
      if (speaker !== remark.speaker) {
        remark.new = true;
        speaker = remark.speaker;
      }
    });
    return data;
  }

  loadVideo(event?: any): void {
    let id = (event && event.target) ? event.target.value : this.videoForm.controls.id.value;
    if (!id) { return; }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: id },
      queryParamsHandling: "merge"
    });
  }
}
