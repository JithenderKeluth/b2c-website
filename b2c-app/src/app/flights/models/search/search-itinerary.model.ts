import { Type } from 'serializer.ts/Decorators';
import { generateUUID } from './../../../general/utils/id-utils';

export class SearchItinerary {
  public id: string;
  public origin: any;
  public destination: any;
  public departDate: string;
  public dept_date: any;
  public arr_date: any;
  public dept_city: any;
  public arr_city: any;
  public returnDate: string;
  public constructor(
    origin?: Location,
    destination?: Location,
    departDate?: string,
    returnDate?: string,
    dept_city?: any,
    arr_city?: any
  ) {
    this.id = generateUUID();
    this.origin = origin;
    this.destination = destination;
    this.dept_city = dept_city;
    this.arr_city = arr_city;
    this.departDate = departDate || '';
    this.returnDate = returnDate || '';
  }
}
