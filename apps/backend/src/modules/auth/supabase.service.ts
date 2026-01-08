import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration');
        }

        this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }

    /**
     * Send OTP to email using Supabase Auth
     * Uses Magic Link email template which should contain {{ .Token }}
     */
    async sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
        const { error } = await this.supabase.auth.signInWithOtp({
            email,
            options: {
                // Don't create user automatically - let the verify step handle it
                shouldCreateUser: true,
                // Disable the magic link redirect - we want the user to enter the token manually
                emailRedirectTo: undefined,
            },
        });

        if (error) {
            console.log('Supabase OTP Error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    }

    /**
     * Verify OTP and get user session
     */
    async verifyOTP(
        email: string,
        token: string,
    ): Promise<{ success: boolean; userId?: string; error?: string }> {
        const { data, error } = await this.supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data.user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, userId: data.user.id };
    }

    /**
     * Get user by Supabase UID
     */
    async getAuthUser(uid: string) {
        const { data, error } = await this.supabase.auth.admin.getUserById(uid);

        if (error) {
            return null;
        }

        return data.user;
    }
}
