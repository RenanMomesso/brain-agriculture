export class DocumentValidator {
  private static readonly ONLY_DIGITS = /[^\d]/g;

  static normalize(document: string): string {
    return document.replace(this.ONLY_DIGITS, '');
  }

  static isValidCpf(cpf: string): boolean {
    const digits = this.normalize(cpf);

    if (!/^\d{11}$/.test(digits)) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    return (
      this.computeDigit(digits, 9) === digits[9] &&
      this.computeDigit(digits, 10) === digits[10]
    );
  }

  static isValidCnpj(cnpj: string): boolean {
    const digits = this.normalize(cnpj);

    if (!/^\d{14}$/.test(digits)) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;

    return (
      this.computeCnpjDigit(digits, 12) === digits[12] &&
      this.computeCnpjDigit(digits, 13) === digits[13]
    );
  }

  static isValidDocument(document: string): boolean {
    const digits = this.normalize(document);
    if (digits.length === 11) return this.isValidCpf(digits);
    if (digits.length === 14) return this.isValidCnpj(digits);
    return false;
  }

  static documentType(document: string): 'CPF' | 'CNPJ' | null {
    const digits = this.normalize(document);
    if (digits.length === 11 && this.isValidCpf(digits)) return 'CPF';
    if (digits.length === 14 && this.isValidCnpj(digits)) return 'CNPJ';
    return null;
  }

  private static computeDigit(digits: string, length: number): string {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return String(rest === 10 ? 0 : rest);
  }

  private static computeCnpjDigit(digits: string, length: number): string {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * weights[i];
    }
    const rest = sum % 11;
    return String(rest < 2 ? 0 : 11 - rest);
  }
}
