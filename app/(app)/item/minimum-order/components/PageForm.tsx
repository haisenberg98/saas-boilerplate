'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

//trpc
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//ui
import Button from '@/components/global/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
//form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    amount: z.coerce
        .number({
            message: 'Minimum order must be a number'
        })
        .gte(1, 'Must be 1 and above')
});

//types
type PageFormProps = {
    initialData: Awaited<ReturnType<(typeof serverClient)['getMinimumOrder']>>;
};

const PageForm = ({ initialData }: PageFormProps) => {
    //router
    const router = useRouter();

    //trpc
    const { data, refetch } = trpc.getMinimumOrder.useQuery(undefined, {
        initialData: initialData,
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    // trpc mutation for updating the item
    const updateData = trpc.updateMinimumOrder.useMutation({
        onSuccess: () => {
            toast.success('Data updated successfully');
            refetch(); // refetch the item data after a successful update
            router.push('/item/list'); // Navigate back to the item list
        },
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                toast.error('Something went wrong: ' + error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    });

    //define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: data?.amount || 0
        }
    });

    //submit
    async function onSubmit(values: z.infer<typeof formSchema>) {
        updateData.mutate({
            amount: values.amount
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-2'>
                <FormField
                    control={form.control}
                    name='amount'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mininum Order Amount</FormLabel>
                            <FormControl>
                                <Input type='text' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='pt-6 md:flex md:justify-center'>
                    <Button className='w-full md:w-auto md:px-14' type='submit'>
                        Update
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PageForm;
