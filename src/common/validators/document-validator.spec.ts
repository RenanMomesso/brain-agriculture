import { DocumentValidator } from './document-validator';

describe('DocumentValidator', () => {
  describe('CPF', () => {
    it('aceita CPFs válidos', () => {
      expect(DocumentValidator.isValidCpf('52998224725')).toBe(true);
      expect(DocumentValidator.isValidCpf('11144477735')).toBe(true);
      expect(DocumentValidator.isValidCpf('123.456.789-09')).toBe(true);
    });

    it('rejeita CPFs inválidos', () => {
      expect(DocumentValidator.isValidCpf('12345678901')).toBe(false);
      expect(DocumentValidator.isValidCpf('00000000000')).toBe(false);
      expect(DocumentValidator.isValidCpf('11111111111')).toBe(false);
      expect(DocumentValidator.isValidCpf('1234567890')).toBe(false);
      expect(DocumentValidator.isValidCpf('123456789012')).toBe(false);
      expect(DocumentValidator.isValidCpf('abc')).toBe(false);
    });
  });

  describe('CNPJ', () => {
    it('aceita CNPJs válidos', () => {
      expect(DocumentValidator.isValidCnpj('12345678000195')).toBe(true);
      expect(DocumentValidator.isValidCnpj('11222333000181')).toBe(true);
      expect(DocumentValidator.isValidCnpj('12.345.678/0001-95')).toBe(true);
    });

    it('rejeita CNPJs inválidos', () => {
      expect(DocumentValidator.isValidCnpj('12345678000190')).toBe(false);
      expect(DocumentValidator.isValidCnpj('00000000000000')).toBe(false);
      expect(DocumentValidator.isValidCnpj('11111111111111')).toBe(false);
      expect(DocumentValidator.isValidCnpj('1234567800019')).toBe(false);
    });
  });

  describe('isValidDocument', () => {
    it('identifica CPF e CNPJ pelo comprimento', () => {
      expect(DocumentValidator.isValidDocument('52998224725')).toBe(true);
      expect(DocumentValidator.isValidDocument('12.345.678/0001-95')).toBe(
        true,
      );
      expect(DocumentValidator.isValidDocument('123.456.789-09')).toBe(true);
      expect(DocumentValidator.isValidDocument('52998224726')).toBe(false);
      expect(DocumentValidator.isValidDocument('12345678')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('remove pontuação', () => {
      expect(DocumentValidator.normalize('12.345.678/0001-95')).toBe(
        '12345678000195',
      );
      expect(DocumentValidator.normalize('123.456.789-09')).toBe('12345678909');
    });
  });

  describe('documentType', () => {
    it('retorna o tipo correto do documento', () => {
      expect(DocumentValidator.documentType('52998224725')).toBe('CPF');
      expect(DocumentValidator.documentType('12345678000195')).toBe('CNPJ');
      expect(DocumentValidator.documentType('123456789')).toBeNull();
    });
  });
});
