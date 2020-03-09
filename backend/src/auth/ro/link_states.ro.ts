import { BasicResponseObject } from '../../common/ro/basic.ro';
import { AuthProvider } from '../auth.auth.provider';

export interface LinkStateResponse extends BasicResponseObject {
  services: (AuthProvider & {
    url: string;
    connected: boolean;
  })[];
}
