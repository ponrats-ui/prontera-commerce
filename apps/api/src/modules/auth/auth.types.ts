export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  sessionId: string;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  roles: string[];
  sid: string;
  typ: "access";
}

export interface JwtRefreshPayload {
  sub: string;
  sid: string;
  typ: "refresh";
}
