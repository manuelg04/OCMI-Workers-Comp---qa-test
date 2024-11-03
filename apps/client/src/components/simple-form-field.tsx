import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui';
import { ComponentProps, ReactNode } from 'react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';

export type SimpleFormFieldProps = {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  render: (props: { field: ControllerRenderProps }) => ReactNode;
} & ComponentProps<typeof FormItem>;

export function SimpleFormField({
  name,
  label,
  description,
  required,
  ...props
}: SimpleFormFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      {...props}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className="text-base">{label}</FormLabel>
          <FormControl>{props.render({ field })}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
