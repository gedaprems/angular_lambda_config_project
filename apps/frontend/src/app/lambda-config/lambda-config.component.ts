import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LambdaService } from '../services/lambda.service';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-lambda-config',
  templateUrl: './lambda-config.component.html',
  styleUrl: './lambda-config.component.scss',
  standalone: true,
  imports: [
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    MatTooltipModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class LambdaConfigComponent implements OnInit {

  title = 'Lambda Configuration';
  showConfig = false;
  envResponses: { [key: string]: any } = {};
  uniqueFunctionNames: string[] = [];
  selectedFunctionName: string = '';
  originalData: any[] = [];
  filteredData: any[] = [];
  envKeys: string[] = [];
  displayedColumns: string[] = ['Key']
  searchKey = '';

  envOptions: any[] = [
    {label: 'test1', value: 'test1'},
    {label: 'stage1 current', value: 'stage1-current'},
    {label: 'stage1 next', value: 'stage1-next'},
    {label: 'load1', value: 'load1'},
    {label: 'prod', value: 'prod'}
  ];

  domainOptions: any[] = [
    {label: 'US', value: 'us'},
    {label: 'OUS', value: 'ous'},
    {label: 'Clinical', value: 'clinical'},
  ];
  
  form: FormGroup;
  isLoading: boolean = false;
  constructor(
    private lambdaService: LambdaService,
    private fb: FormBuilder
  ) { 
    this.form = this.fb.group({
      groups: this.fb.array([this.createGroup('test1', 'us'), this.createGroup('test1', 'ous'), this.createGroup('test1', 'clinical')])
    });
  }

  ngOnInit(): void { }

  createGroup(selectedEnv: string, selectedDomain: string): FormGroup {
    const group = this.fb.group({
      selectedEnv: [selectedEnv, Validators.required],
      selectedDomain: [selectedDomain, Validators.required]
    });

    group.get('selectedEnv')?.valueChanges.subscribe((envValue) => {
      if (envValue) {
        // If an environment is selected, set selectedDomain to 'US'
        group.get('selectedDomain')?.setValue('us');
      } else {
        // If no environment is selected, reset selectedDomain to null (empty)
        group.get('selectedDomain')?.setValue('');
      }
    });

    return group;
  }

  get groups(): FormArray {
    return this.form?.get('groups') as FormArray;
  }

  private sortConfigData(data: any) {
    this.showConfig = true;
    this.envResponses = data?.envResponses;
    this.uniqueFunctionNames = data?.uniqueFunctionNames?.sort((a:string, b:string) => a.localeCompare(b));
    this.envKeys = Object.keys(this.envResponses);
    this.displayedColumns = ['Key', ...this.envKeys];
    this.onFunctionNameChange('');
  }

  fetchConfigDataFromLocal() {
    if (this.form?.valid) {
      this.showConfig = false;
      this.isLoading = true;
      this.lambdaService.fetchData(this.form.value).subscribe(data => {
        this.isLoading = false;
        this.sortConfigData(data);
      });
    }
  }

  fetchLatest() {
    if (this.form?.valid) {
      this.showConfig = false;
      this.isLoading = true;
      this.lambdaService.getLambdasFromAWS(this.form.value).subscribe(data => {
        this.isLoading = false;
        this.sortConfigData(data);
      });
    }
  }

  onFunctionNameChange(functionName: string): void {
    this.selectedFunctionName = functionName;
    this.updateTableData(functionName);
  }

  updateTableData(functionName: string): void {
    this.originalData = [];

    Object.keys(this.envResponses).forEach(env => {
      const envData: any = this.envResponses[env];
      
      const functionData = envData?.lambdas?.find((item: any) => item.FunctionName === functionName);
      
      if (functionData) {
        Object.keys(functionData).forEach(key => {
          if (key !== 'FunctionName' && key !== 'ResponseMetadata') {
            let row = this.originalData.find(r => r.Key === key);
            if (!row) {
              row = { Key: key };
              this.originalData.push(row);
            }
            row[env] = functionData[key];
          }
        });
      }
    });
    this.filteredData = this.originalData;
    this.searchKey = '';
  }

  isRowHighlighted(row: any): boolean {
    const values = this.envKeys.map(env => row[env]);
    return values.some((value, idx) => {
      const otherValues = values.filter((_, i) => i !== idx);
      if (this.isObject(value)) {
        return otherValues.some(otherValue => 
          this.isObject(otherValue) && JSON.stringify(value) !== JSON.stringify(otherValue)
        );
      }
      return otherValues.some(otherValue => value !== otherValue);
    });
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object';
  }

  filterTable(): void {
    if (this.searchKey.trim() === '') {
      this.filteredData = this.originalData;
    } else {
      this.filteredData = this.originalData.filter(row =>
        row.Key.toLowerCase().includes(this.searchKey.toLowerCase())
      );
    }
  }
}
