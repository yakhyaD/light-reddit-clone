import { ErrorField } from "../generated/graphql"

export const ToErrorMap = (errors: ErrorField[])=> {
    const errorMap: Record<string, string> = {}
    errors.forEach(({field, message}) => {
        errorMap[field] = message
    })
    return errorMap;
}
