'use client';

import React from 'react';

//nextjs
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Button from '@/components/global/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSignIn, useSignUp } from '@clerk/nextjs';
//clerk
import { OAuthStrategy } from '@clerk/types';
//form
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
//icons
import { FaGoogle } from 'react-icons/fa';
//ui
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters'
    })
});

const Login = () => {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { signUp } = useSignUp();
    const router = useRouter();

    //define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    //login with sso
    const signInWith = (strategy: OAuthStrategy) => {
        if (!signIn) return null;
        return signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: '/login/sso-callback',
            redirectUrlComplete: '/'
        });
    };

    async function handleSignIn(strategy: OAuthStrategy) {
        if (!signIn || !signUp) return null;

        // If the user has an account in your application, but does not yet
        // have an OAuth account connected to it, you can transfer the OAuth
        // account to the existing user account.
        const userExistsButNeedsToSignIn =
            signUp.verifications.externalAccount.status === 'transferable' &&
            signUp.verifications.externalAccount.error?.code === 'external_account_exists';

        if (userExistsButNeedsToSignIn) {
            const res = await signIn.create({ transfer: true });

            if (res.status === 'complete') {
                setActive({
                    session: res.createdSessionId
                });
            }
        }

        // If the user has an OAuth account but does not yet
        // have an account in your app, you can create an account
        // for them using the OAuth information.
        const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

        if (userNeedsToBeCreated) {
            const res = await signUp.create({
                transfer: true
            });

            if (res.status === 'complete') {
                setActive({
                    session: res.createdSessionId
                });
            }
        } else {
            // If the user has an account in your application
            // and has an OAuth account connected to it, you can sign them in.
            signInWith(strategy);
        }
    }

    //login with email and password
    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { email: emailAddress, password } = values;
        if (!isLoaded) return;

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password: password,
                redirectUrl: '/'
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.push('/');
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
                toast.error('Email or password is incorrect. Please try again.');
            }
        } catch (err: any) {
            switch (err.errors[0]?.code) {
                case 'form_identifier_not_found':
                    toast.error('Email or password is incorrect.');
                    break;
                case 'form_password_incorrect':
                    toast.error('Email or password is incorrect.');
                    break;
                case 'too_many_attempts':
                    toast.error('Too many attempts. Please try again later.');
                    break;
                default:
                    toast.error('An error occurred. Please try again later.');
                    break;
            }
        }
    }

    return (
        <div className='container flex min-h-screen flex-col items-center justify-center space-y-6 px-6 md:px-10 lg:max-w-3xl'>
            <Link href='/'>
                <h2>Kōfē</h2>
            </Link>
            <h4>Login</h4>
            <Button onClick={() => handleSignIn('oauth_google')} className='flex items-center space-x-2'>
                <FaGoogle />
                <span>Continue with Google</span>
            </Button>

            <div className='my-4 flex w-full items-center'>
                <div className='divider w-full'></div>

                <span className='text-accentDarker mx-4 flex-shrink'>or</span>
                <div className='divider w-full'></div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-6'>
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type='email' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type='password' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='pt-4'>
                        <Button type='submit'>Login</Button>
                    </div>
                </form>
            </Form>
            <div className='flex space-x-2 self-start'>
                <span>Don&apos;t have an account ?</span>{' '}
                <Link href='/register' className='text-foreground underline'>
                    Register
                </Link>
            </div>
        </div>
    );
};

export default Login;
