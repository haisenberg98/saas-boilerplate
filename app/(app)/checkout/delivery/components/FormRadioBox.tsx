import React from 'react';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormRadioBoxProps {
    control: any;
}

const FormRadioBox = ({ control }: FormRadioBoxProps) => {
    return (
        <FormField
            control={control}
            name='deliveryMethod'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Shipping Method</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                            <FormItem className='flex items-center space-x-3 space-y-0'>
                                <FormControl>
                                    <RadioGroupItem value='tracked' />
                                </FormControl>
                                <FormLabel className='font-normal'>Tracked Delivery - FREE</FormLabel>
                            </FormItem>
                            <FormItem className='items-center space-x-3 space-y-0'>
                                <FormControl>
                                    <RadioGroupItem value='express' />
                                </FormControl>
                                <FormLabel className='font-normal'>NZ Post Same Day Evening Express - $12.00</FormLabel>
                            </FormItem>
                        </RadioGroup>
                        <FormLabel className='font-normal'>Tracked Delivery - FREE</FormLabel>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default FormRadioBox;
