import { includes, isEmpty, isNaN, join, parseInt, split, toLower } from 'lodash';

/**
 * Finds by key a query parameter if it exists, else returns `undefined`
 * @param queryParameterString The query parameter string to look within
 * @param queryParameterKey The query parameter key
 */
function getQueryParameterStringValue(queryParameterString: string, queryParameterKey: string): string {
  if (getQueryParameterValue(queryParameterString, queryParameterKey)) {
    return getQueryParameterValue(queryParameterString, queryParameterKey);
  }
}

/**
 * Finds by key and parses a query parameter value as an integer if it exists, else returns `0`
 * @param queryParameterString The query parameter string to look within
 * @param queryParameterKey The query parameter key
 */
function getQueryParameterIntegerValue(queryParameterString: string, queryParameterKey: string): number {
  const integerValue = parseInt(getQueryParameterValue(queryParameterString, queryParameterKey), 10);

  return isNaN(integerValue) ? 0 : integerValue;
}

/**
 * Finds by key and parses a query parameter value as a boolean if it exists, else returns `undefined`
 * @param queryParameterString The query parameter string to look within
 * @param queryParameterKey The query parameter key
 */
function getQueryParameterBooleanValue(queryParameterString: string, queryParameterKey: string): boolean | undefined {
  const lowerCaseValue = toLower(getQueryParameterValue(queryParameterString, queryParameterKey));

  if (lowerCaseValue === 'true' || lowerCaseValue === 'yes') {
    return true;
  } else if (lowerCaseValue === 'false' || lowerCaseValue === 'no') {
    return false;
  }
}

/**
 * Finds by key and parses a query parameter value as an array if it exists, else returns `undefined`
 * @param queryParameterString The query parameter string to look within
 * @param queryParameterKey The query parameter key
 */
function getQueryParameterArrayValue(queryParameterString: string, queryParameterKey: string): string[] {
  const arrayString = getQueryParameterValue(queryParameterString, queryParameterKey);
  if (arrayString === undefined) {
    return;
  }
  if (isEmpty(arrayString)) {
    return [];
  }
  return split(arrayString, ',');
}

function getQueryParameterValue(queryParameterString: string, queryParameterKey: string): string {
  if (!queryParameterString) {
    return;
  }

  const regex = findQueryParameterByKeyRegex(queryParameterKey);

  if (!regex.test(queryParameterString)) {
    return;
  }

  if (queryParameterString) {
    return regex.exec(queryParameterString)[0].split('=')[1];
  }
}

/**
 * Returns a new RegExp object created to find the specified query parameter by its key
 * @param queryParameterKey The query parameter key
 */
function findQueryParameterByKeyRegex(queryParameterKey: string): RegExp {
  return new RegExp(`\\??&?${queryParameterKey}=[^&]*`);
}

/**
 * Append query parameters to a base url
 * @param url the base url
 * @param params string array of parameters to add
 */
function appendQueryParameterToUrl(url: string, params?: string[]): string {
  if (isEmpty(params)) {
    return url;
  }

  return `${url}${includes(url, '?') ? '' : '?'}${join(params, '&')}`;
}

export {
  getQueryParameterStringValue,
  getQueryParameterIntegerValue,
  getQueryParameterBooleanValue,
  getQueryParameterArrayValue,
  findQueryParameterByKeyRegex,
  appendQueryParameterToUrl,
};
