import {Component, ElementRef, ViewChild, group} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  form: FormGroup;
  jsonData: any;
  loading: Boolean = true;
  showChart: Boolean = false;

  chartData = [];

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      dataFile: null
    });
  }

  onFileChange(event): void {
    // this.showChart = false;
    this.loading = true;
    // console.log('On file change fired');
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      // console.log('Inside file event');
      const file = event.target.files[0];
      const fileExtension = file.name.substring(file.name.length - 4, file.name.length + 1);
      if (fileExtension === 'json') {
        reader.readAsText(file);
        reader.onload = () => {
          this.form.get('dataFile').setValue({
            filename: file.name,
            filetype: file.type,
            value: reader.result,
          });
        };
        this.loading = false;
      } else {
        alert('Only Json files are accepted.');
        this.form.get('dataFile').setValue(null);
      }
    }
  }

  onSubmit(): void {
    const formModel = this.form.value;
    this.jsonData = JSON.parse(formModel.dataFile.value);
    console.log('Json data: ', this.jsonData);
    this.chartData = [];
    this.prepareChartData();
    // console.log('Forms Data: ', formModel);
  }

  prepareChartData(): void {
    // const group1Peaks = this.jsonData.groups[0].peaks;
    this.jsonData.groups.forEach(element => {
      // console.log('Group 1 Peaks: ', group1Peaks);
      const peaks = element.peaks;
      const nonZeroEics = [];
      const lineChartData = [];
      const lineChartLabels = [];
      let maxLength = 0;

      const eics = peaks.map(p => {
        return {
          retentionTime: p.eic.rt,
          intensity: p.eic.intensity,
          sampleName: p.sampleName
        };
      });

      // eics.forEach(el => {
      //   lineChartData.push({
      //     data: el.intensity,
      //     label: el.sampleName
      //   });
      // });

      // lineChartLabels.push(eics[eics.length - 1].retentionTime);

      eics.forEach(el => {
        const intensity = [];
        const retentionTime = [];
        for (let i = 0; i < el.intensity.length; i++ ) {
          if (el.intensity[i] > 0) {
            intensity.push(el.intensity[i]);
            retentionTime.push(el.retentionTime[i]);
          }
        }
        nonZeroEics.push({
          intensity,
          retentionTime,
          sampleName: el.sampleName
        });
      });

      console.log('eics: ', eics);
      console.log('Non zero eics: ', nonZeroEics);
      this.showChart = true;

      let low = 999999999.99;
      let high = 0.0;

      nonZeroEics.forEach(el => {
        lineChartData.push({
          data: el.intensity,
          label: el.sampleName
        });
        if (el.retentionTime.length > maxLength) {
          maxLength = el.retentionTime.length;
        }
        el.retentionTime.forEach(rt => {
          if (rt < low) {
            low = rt;
          }
          if (rt > high) {
            high = rt;
          }
        });
      });

      const division = (high - low) / 10;

      // console.log('High: ', high);
      // console.log('Low: ', low);

      lineChartLabels.push(low);

      for (let i = 2; i <= maxLength; i++) {
        low += division;
        lineChartLabels.push(low);
      }

      // lineChartLabels.push(high);

      this.chartData.push({
        groupId: element.groupId,
        lineChartData,
        lineChartLabels
      });
      // console.log('Chart Lables: ', this.lineChartLabels);
      // console.log('Chart Data: ', this.lineChartData);
    });

    console.log('Chart Data: ', this.chartData);

    // this.showChart = true;
  }
 }
