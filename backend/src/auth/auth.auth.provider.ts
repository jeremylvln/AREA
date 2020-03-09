export interface AuthProviderBasic {
  kind: string;
  id: string;
  name: string;
}

export interface AuthProviderForm {
  inputs: {
    tokenName: string;
    formId: string;
    name: string;
    description: string;
  }[];
}

export interface AuthProviderExternal {
  url: string;
}

export type AuthProvider = AuthProviderBasic & (| AuthProviderForm | AuthProviderExternal);