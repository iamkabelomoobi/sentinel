const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type AuthBody = Record<string, unknown>;

export type AuthUserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "CONTROL_ROOM"
  | "MANAGER"
  | "RESPONDER"
  | "GUARD"
  | "CLIENT";

export type AuthUserStatus = "INVITED" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: AuthUserRole;
  status?: AuthUserStatus;
  image?: string | null;
};

export type AuthSession = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
  user: AuthSessionUser;
};

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

function readErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Something went wrong. Please try again.";
  }

  const record = data as Record<string, unknown>;
  const nestedError = record.error;

  if (typeof record.message === "string") {
    return record.message;
  }

  if (nestedError && typeof nestedError === "object") {
    const errorRecord = nestedError as Record<string, unknown>;
    if (typeof errorRecord.message === "string") {
      return errorRecord.message;
    }
  }

  if (typeof record.code === "string") {
    return record.code.replaceAll("_", " ").toLowerCase();
  }

  return "Something went wrong. Please try again.";
}

async function authRequest<T>(
  path: string,
  options: RequestInit & { body?: BodyInit | null } = {},
) {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new AuthApiError(readErrorMessage(data));
  }

  return data as T;
}

function jsonBody(body: AuthBody) {
  return JSON.stringify(body);
}

export const authApi = {
  signIn(email: string, password: string) {
    return authRequest("/api/auth/sign-in/email", {
      method: "POST",
      body: jsonBody({ email, password }),
    });
  },
  signUp(name: string, email: string, password: string) {
    return authRequest("/api/auth/sign-up/email", {
      method: "POST",
      body: jsonBody({ name, email, password, role: "CLIENT" }),
    });
  },
  requestPasswordReset(email: string, redirectTo: string) {
    return authRequest("/api/auth/request-password-reset", {
      method: "POST",
      body: jsonBody({ email, redirectTo }),
    });
  },
  resetPassword(token: string, newPassword: string) {
    return authRequest("/api/auth/reset-password", {
      method: "POST",
      body: jsonBody({ token, newPassword }),
    });
  },
  verifyEmail(token: string) {
    return authRequest(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
      },
    );
  },
  sendVerificationEmail(email: string, callbackURL: string) {
    return authRequest("/api/auth/send-verification-email", {
      method: "POST",
      body: jsonBody({ email, callbackURL }),
    });
  },
  getSession() {
    return authRequest<AuthSession | null>("/api/auth/get-session", {
      method: "GET",
    });
  },
  signOut() {
    return authRequest("/api/auth/sign-out", {
      method: "POST",
    });
  },
};
