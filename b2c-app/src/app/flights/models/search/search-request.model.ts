import { SearchData } from './search-data.model';
import { ExportedLocales } from '../../../_core/models/exported-locales.model';

export class SearchRequest extends SearchData {
  public locale: ExportedLocales;
  public userProfileUsername: string;
  public businessLoggedOnToken: string;
  public dataToken: string;
  public dataTokenType: string;
  public isDeepLink: boolean;
}
