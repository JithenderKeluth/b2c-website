/**
 * The encrypted hash of the response object containing this object
 *
 * Used by wep-api to ensure data integrity in future requests
 */
export interface ApiEncryptedData {
  size: number;
  data: string;
}
