"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SignUpInput } from "@sentinel/schemas/auth";

import { authApi } from "./auth-api";

export const authQueryKeys = {
  session: ["auth", "session"] as const,
};

export function getAuthErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
    },
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (input: SignUpInput) => authApi.signUp(input),
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: ({
      email,
      redirectTo,
    }: {
      email: string;
      redirectTo: string;
    }) => authApi.requestPasswordReset(email, redirectTo),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: ({ token }: { token: string }) => authApi.verifyEmail(token),
  });
}

export function useSendVerificationEmailMutation() {
  return useMutation({
    mutationFn: ({
      email,
      callbackURL,
    }: {
      email: string;
      callbackURL: string;
    }) => authApi.sendVerificationEmail(email, callbackURL),
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSettled: () => {
      queryClient.clear();
    },
  });
}
