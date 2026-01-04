/**
 * Two-Factor Authentication (2FA) Utilities
 * Uses Supabase MFA with TOTP (Time-based One-Time Password)
 * Compatible with Google Authenticator, Authy, etc.
 */

import { supabase } from "@/integrations/supabase/client";

export interface MFAFactor {
    id: string;
    friendly_name: string;
    factor_type: "totp";
    status: "verified" | "unverified";
    created_at: string;
    updated_at: string;
}

export interface EnrollMFAResponse {
    id: string;
    type: "totp";
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
}

/**
 * Check if user has MFA enabled
 */
export async function hasMFAEnabled(): Promise<boolean> {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error || !data) return false;

    return data.totp.some(factor => factor.status === "verified");
}

/**
 * Get all MFA factors for current user
 */
export async function getMFAFactors(): Promise<MFAFactor[]> {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error || !data) return [];

    return data.totp as MFAFactor[];
}

/**
 * Start MFA enrollment - generates QR code
 */
export async function enrollMFA(friendlyName: string = "Authenticator App"): Promise<EnrollMFAResponse | null> {
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName,
    });

    if (error) {
        console.error("MFA enrollment error:", error);
        return null;
    }

    return data as EnrollMFAResponse;
}

/**
 * Verify MFA enrollment with code from authenticator app
 */
export async function verifyMFAEnrollment(
    factorId: string,
    code: string
): Promise<boolean> {
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
    });

    if (challengeError) {
        console.error("MFA challenge error:", challengeError);
        return false;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
    });

    if (verifyError) {
        console.error("MFA verify error:", verifyError);
        return false;
    }

    return true;
}

/**
 * Verify MFA code during login
 */
export async function verifyMFALogin(
    factorId: string,
    code: string
): Promise<boolean> {
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
    });

    if (challengeError) {
        console.error("MFA challenge error:", challengeError);
        return false;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
    });

    if (verifyError) {
        console.error("MFA verify error:", verifyError);
        return false;
    }

    return true;
}

/**
 * Remove MFA factor (disable 2FA)
 */
export async function unenrollMFA(factorId: string): Promise<boolean> {
    const { error } = await supabase.auth.mfa.unenroll({
        factorId,
    });

    if (error) {
        console.error("MFA unenroll error:", error);
        return false;
    }

    return true;
}

/**
 * Check if current session requires MFA verification
 */
export async function requiresMFAVerification(): Promise<{
    required: boolean;
    factorId?: string;
}> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { required: false };

    const { data: factorsData } = await supabase.auth.mfa.listFactors();

    if (!factorsData || factorsData.totp.length === 0) {
        return { required: false };
    }

    const verifiedFactor = factorsData.totp.find(f => f.status === "verified");

    if (!verifiedFactor) return { required: false };

    // Check AAL level
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
        return { required: true, factorId: verifiedFactor.id };
    }

    return { required: false };
}

/**
 * Get current authentication assurance level
 */
export async function getAuthLevel(): Promise<"aal1" | "aal2" | null> {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error || !data) return null;

    return data.currentLevel as "aal1" | "aal2";
}
