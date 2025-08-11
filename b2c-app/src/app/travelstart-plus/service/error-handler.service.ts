import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  handleErrorCode(errorCode: string): string {
    const groups = errorCode.split('.');

    switch (groups[0]) {
      case '000':
        return this.handleSuccessfulTransactions(groups);
      case '100':
        return this.handlePendingTransactions(groups);
      case '800':
        return this.handleRejectedTransactions(groups);
      case '900':
        return this.handleCommunicationErrors(groups);
      case '600':
        return this.handleSystemErrors(groups);
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  private handleSuccessfulTransactions(groups: string[]): string {
    const successPatterns = /^(000.000.|000.100.1|000.[36]|000.400.[1][12]0)/;

    if (successPatterns.test(groups.join('.'))) {
      return this.handleSuccessfulResults(groups);
    } else if (/^(000.400.0[^3]|000.400.100)/.test(groups.join('.'))) {
      return this.handleManualReviewResults(groups);
    } else if (/^(000\.200)|^(800\.400\.5|100\.400\.500)/.test(groups.join('.'))) {
      return this.handlePendingResults(groups);
    }

    return 'An unexpected success code occurred. Please contact support.';
  }

  private handleSuccessfulResults(groups: string[]): string {
    return 'Transaction succeeded';
  }

  private handleManualReviewResults(groups: string[]): string {
    return 'Transaction succeeded. Please review manually.';
  }

  private handlePendingResults(groups: string[]): string {
    return 'Transaction pending. Please wait for further updates.';
  }

  private handlePendingTransactions(groups: string[]): string {
    const pendingPatterns = /^(000\.200|800\.400\.5|100\.400\.500)/;

    if (pendingPatterns.test(groups.join('.'))) {
      return this.handlePendingResults(groups);
    }

    return 'An unexpected pending code occurred. Please contact support.';
  }

  private handleRejectedTransactions(groups: string[]): string {
    const rejectionPatterns = /^(000.400.[1][0-9][1-9]|000.400.2|800.[17]00|800\.800\.[123])/;

    if (rejectionPatterns.test(groups.join('.'))) {
      return this.handleRejections(groups);
    }

    return 'An unexpected rejection code occurred. Please contact support.';
  }

  private handleRejections(groups: string[]): string {
    return 'Transaction declined. Please check the error details.';
  }

  private handleCommunicationErrors(groups: string[]): string {
    const communicationPatterns = /^(900\.[1234]00|000\.400\.030)/;

    if (communicationPatterns.test(groups.join('.'))) {
      return this.handleCommunicationErrorsResults(groups);
    }

    return 'An unexpected communication error code occurred. Please contact support.';
  }

  private handleCommunicationErrorsResults(groups: string[]): string {
    return 'Communication error. Please check your network connection.';
  }

  private handleSystemErrors(groups: string[]): string {
    const systemPatterns = /^(800\.[56]|999\.|600\.1|800\.800\.[84])/;

    if (systemPatterns.test(groups.join('.'))) {
      return this.handleSystemErrorsResults(groups);
    }

    return 'An unexpected system error code occurred. Please contact support.';
  }

  private handleSystemErrorsResults(groups: string[]): string {
    return 'System error. Please try again later.';
  }
}
