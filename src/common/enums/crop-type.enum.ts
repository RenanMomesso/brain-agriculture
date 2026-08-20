export const CROP_TYPES = [
  'SOJA',
  'MILHO',
  'ALGODAO',
  'CAFE',
  'CANA_DE_ACUCAR',
] as const;

export type CropType = (typeof CROP_TYPES)[number];

export const STATE_UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export type StateUf = (typeof STATE_UFS)[number];
