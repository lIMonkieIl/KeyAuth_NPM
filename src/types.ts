export type KeyAuthDetails = {
  name: string;
  ownerId: string;
  secret: string;
  version: string;
};
export type KeyAuthOptions = {
  apiVer?: string;
  useEncKey?: boolean;
  logs?: boolean;
};
