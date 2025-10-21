'use client';
import React, { useState } from 'react';

//trpc
import { trpc } from '@/app/_trpc/client';

//nextjs
import Link from 'next/link';
import { useRouter } from 'next/navigation';

//clerk
import { OAuthStrategy } from '@clerk/types';
import { useSignIn, useSignUp } from '@clerk/nextjs';

//icons
import { FaGoogle } from 'react-icons/fa';

//ui
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import Button from '@/components/global/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

//form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: 'First name must be at least 2 characters',
  }),
  last_name: z.string().min(2, {
    message: 'Last name must be at least 2 characters',
  }),
  email: z.string().email('Email is invalid. Please enter a valid email'),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

const verificationFormSchema = z.object({
  verification_code: z.string().min(6, {
    message: 'Verification code must be at least 6 characters',
  }),
});

const Register = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const [pendingVerification, setPendingVerification] = useState(false);
  const router = useRouter();
  const addUser = trpc.addUser.useMutation();

  //define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
  });

  //verification form
  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      verification_code: '',
    },
  });

  //login with sso
  const signInWith = (strategy: OAuthStrategy) => {
    if (!signIn) return null;
    return signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/login/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  async function handleSignIn(strategy: OAuthStrategy) {
    if (!signIn || !signUp) return null;

    // If the user has an account in your application, but does not yet
    // have an OAuth account connected to it, you can transfer the OAuth
    // account to the existing user account.
    const userExistsButNeedsToSignIn =
      signUp.verifications.externalAccount.status === 'transferable' &&
      signUp.verifications.externalAccount.error?.code ===
        'external_account_exists';

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });

      if (res.status === 'complete') {
        setActive({
          session: res.createdSessionId,
        });
      }
    }

    // If the user has an OAuth account but does not yet
    // have an account in your app, you can create an account
    // for them using the OAuth information.
    const userNeedsToBeCreated =
      signIn.firstFactorVerification.status === 'transferable';

    if (userNeedsToBeCreated) {
      const res = await signUp.create({
        transfer: true,
      });

      if (res.status === 'complete') {
        setActive({
          session: res.createdSessionId,
        });
      }
    } else {
      // If the user has an account in your application
      // and has an OAuth account connected to it, you can sign them in.
      signInWith(strategy);
    }
  }

  // submit form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { first_name, last_name, email, password } = values;

    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        password: password,
      });

      //add user to database
      addUser.mutate({ firstName: first_name, lastName: last_name, email });

      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      //notify the user that the email has been sent to their email
      toast.success('Verification email sent. Please check your email.');

      // change the UI to our pending section.
      setPendingVerification(true);

      await signUp.update({
        firstName: first_name,
        lastName: last_name,
      });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      switch (err.errors[0]?.code) {
        case 'form_identifier_exists':
          toast.error('Email registered. Please enter a different email.');
          break;
        case 'form_password_pwned':
          toast.error(
            'Password is too common. Please enter a different password.'
          );
          break;
        case 'form_param_format_invalid':
          toast.error('Email is invalid. Please enter a valid email.');
          break;
        case 'form_password_length_too_short':
          toast.error('Password is too short. Please enter a longer password.');
          break;
        default:
          toast.error('An error occurred. Please try again later.');
          break;
      }
    }
  }

  // verify email
  async function onPressVerify(values: z.infer<typeof verificationFormSchema>) {
    const { verification_code } = values;
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification_code,
      });
      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/');
      }
    } catch (err: any) {
      // console.error(JSON.stringify(err, null, 2));
      switch (err.errors[0]?.code) {
        case 'form_code_incorrect':
          toast.error('Verification code is incorrect.');
          break;
        default:
          toast.error('An error occurred. Please try again later.');
          break;
      }
    }
  }

  return (
    <div className='container min-h-screen flex flex-col items-center justify-center space-y-6 px-6 md:px-10 lg:max-w-4xl'>
      <Link href='/'>
        <h2>Kōfē</h2>
      </Link>
      <h4>Register</h4>
      {!pendingVerification && (
        <>
          <Button
            onClick={() => handleSignIn('oauth_google')}
            className='flex space-x-2 items-center'
          >
            <FaGoogle />
            <span>Continue with Google</span>
          </Button>

          <div className='flex items-center my-4 w-full'>
            <div className='divider w-full'></div>
            <span className='flex-shrink mx-4 text-accentDarker'>or</span>
            <div className='divider w-full'></div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col w-full space-y-6'
            >
              <div className='grid grid-cols-1 gap-4 my-4 lg:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='first_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='last_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                <Button type='submit'>Register</Button>
              </div>
            </form>
          </Form>

          <div className='flex self-start space-x-2'>
            <span>Already have an account?</span>{' '}
            <Link href='/login' className='text-foreground underline'>
              Login
            </Link>
          </div>
        </>
      )}

      {pendingVerification && (
        <Form {...verificationForm}>
          <form
            onSubmit={verificationForm.handleSubmit(onPressVerify)}
            className='flex flex-col w-full space-y-6'
          >
            <FormField
              control={verificationForm.control}
              name='verification_code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='pt-4'>
              <Button type='submit'>Verify email</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default Register;
