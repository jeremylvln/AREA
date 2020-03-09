import { Form } from "./modules.form";

export interface CRUDObjectRo {
  service: string;
  name: string;
  description: string;
  form: Form;
}