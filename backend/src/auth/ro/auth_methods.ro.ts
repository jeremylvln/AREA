import { BasicResponseObject } from '../../common/ro/basic.ro';

export interface AuthMethodEntry {
  id: string;
  name: string;
  url: string;
}

export interface AuthMethodsResponse extends BasicResponseObject {
  methods: AuthMethodEntry[];
}
