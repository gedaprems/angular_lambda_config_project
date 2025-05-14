import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LambdaService {

  constructor(private http: HttpClient) { }

  fetchData(config: any): Observable<any> {
    const lambdPaths = this.createEnvPaths(config);
    const requests = lambdPaths.map(path => {
      const apiPath = this.extractApiPathFromPath(path);
      return this.http.get<any[]>(`${environment.apiUrl}/local-lambdas/${apiPath}`).pipe(
        catchError(error => {
          console.error(`Error fetching from ${apiPath}`, error);
          return of([]);
        })
      );
    });

    return this.fetchRequestData(requests, lambdPaths);
  }

  getLambdasFromAWS(config: any): Observable<any> {
    const lambdPaths = this.createEnvPaths(config);

    const requests = lambdPaths.map(path => {
      const apiPath = this.extractApiPathFromPath(path);
      return this.http.get<any[]>(`${environment.apiUrl}/lambdas/${apiPath}`).pipe(
        catchError(error => {
          console.error(`Error fetching from ${apiPath}`, error);
          return of([]);
        })
      );
    });

    return this.fetchRequestData(requests, lambdPaths);
  }

  private fetchRequestData(requests: any, lambdPaths: any) {
    return forkJoin(requests).pipe(
      map((responses: any) => {
        const envResponses: { [key: string]: any[] } = {};
  
        lambdPaths.forEach((path: string, index: number) => {
          const envName = path.split('/')[2] + ' (' + path.split('/')[3] + ')';
          envResponses[envName] = responses[index];
        });

        const functionNames: string[] = [];

        Object.values(envResponses).forEach((responseArray: any) => {
          responseArray?.lambdas.forEach((item: any) => {
            if (item.FunctionName && !functionNames.includes(item.FunctionName)) {
              functionNames.push(item.FunctionName);
            }
          });
        });

        const uniqueFunctionNames = Array.from(new Set(functionNames));
        return {
          envResponses,
          uniqueFunctionNames,
        };
      }),
      catchError((error) => {
        console.error('Error merging data', error);
        return of({});
      })
    );
  }
  

  extractUniqueFunctionNames(response: any[]): string[] {
    const functionNames = response.map(item => item.FunctionName);
    const uniqueFunctionNames = [...new Set(functionNames)];
    return uniqueFunctionNames;
  }

  createEnvPaths(configData: any): string[] {
    const envPathSet = new Set<string>();

    configData.groups.forEach((config: any) => {
      const path = `lambda-config/env/${config.selectedEnv}/${config.selectedDomain}/lambda-config.json`;
      envPathSet.add(path);
    });

    return Array.from(envPathSet);
  }

  private extractApiPathFromPath(path: string): string {
    const match = path.match(/env\/([^/]+)\/([^/]+)/);
    if (match) {
      const [_, env, domain] = match;
      return `${env}_${domain}`;
    }
    console.warn(`⚠️ Could not extract apiPath from: ${path}`);
    return '';
  }
}
