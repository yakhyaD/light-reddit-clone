import React, { InputHTMLAttributes } from 'react';
import { FormControl, FormLabel, FormErrorMessage, Input, Textarea } from '@chakra-ui/react';
import { Field, FieldHookConfig, useField } from 'formik';

type InputFieldProps =  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textarea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({label, textarea, size, ...props}) => {
    const [ field, { error} ] = useField(props)
    let InputOrTextarea: any = Input;
    if (textarea) {
        InputOrTextarea = Textarea;
    }
    return (
        <FormControl isInvalid={!!error} w="100%">
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <InputOrTextarea {...field} {...props}  id={field.name} placeholder={props.placeholder}/>
                <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
        );
}

export default InputField;
