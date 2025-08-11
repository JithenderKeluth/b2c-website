/**
 *
 * @param {string} airlineCode (optional) the relevant airline code, eg. 'FA'
 * @return {string} the uri for the appropriate airline logo, or the uri for the default image if no airlineCode provided
 */
function getAirlineImageUri(airlineCode: string = 'DEFAULT'): string {
  return `assets/img/carriers/retina48px/carrier-${airlineCode}.png`;
}

export { getAirlineImageUri };
