export interface ResponseErrorDetails {
  message: string;
  more?: any;
}

export interface BasicResponseObject {
  error?: ResponseErrorDetails;
}
