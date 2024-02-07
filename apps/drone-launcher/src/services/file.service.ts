import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileService {
  async replaceInFile(
    filePath: string,
    searchValue: RegExp,
    replaceValue: string,
  ): Promise<void> {
    const data = fs.readFileSync(filePath, 'utf8');
    const newData = data.replace(searchValue, replaceValue);
    fs.writeFileSync(filePath, newData, 'utf-8');
  }

  async getJsonFile<T>(filePath: string): Promise<T> {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
  }
}
