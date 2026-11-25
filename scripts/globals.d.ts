interface Response {
  json(): Promise<any>;
}

declare module "pg" {
  const content: any;
  export default content;
  export const Pool: any;
  export const Client: any;
}
