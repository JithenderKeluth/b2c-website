export class Travellers {
  public adults: number;
  public youngAdults: number;
  public children: number;
  public infants: number;

  /**
   * Set defaults
   */
  public constructor(adults?: number, youngAdults?: number, children?: number, infants?: number) {
    this.adults = adults || 1;
    this.youngAdults = youngAdults || 0;
    this.children = children || 0;
    this.infants = infants || 0;
  }

  public getCount(): number {
    return (this.adults || 0) + (this.youngAdults || 0) + (this.children || 0) + (this.infants || 0);
  }
}
