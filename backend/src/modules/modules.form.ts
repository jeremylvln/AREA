export interface FormInputBase {
  formId: string;
  name: string;
  description: string;
  optional?: boolean;
}

export interface FormInputText {
  kind: 'text';
  minLength?: number;
  maxLength?: number;
}

export interface FormInputNumber {
  kind: 'number';
  minValue?: number;
  maxValue?: number;
}

export interface FormInputCheckbox {
  kind: 'checkbox';
}

export interface FormInputRadiobox {
  kind: 'radiobox';
  choices: {
    name: string;
    value: string;
  }[];
}

export interface FormInputSelect {
  kind: 'select';
  choices: {
    name: string;
    value: string;
  }[];
}

export type FormInput = FormInputBase & (| FormInputText |
  FormInputNumber | FormInputCheckbox | FormInputRadiobox |
  FormInputSelect);

export interface Form {
  inputs: FormInput[];
}