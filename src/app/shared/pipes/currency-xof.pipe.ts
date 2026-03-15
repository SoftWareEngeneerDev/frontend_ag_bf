import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyXof' })
export class CurrencyXofPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '— XOF';
    return value.toLocaleString('fr-FR') + ' XOF';
  }
}
