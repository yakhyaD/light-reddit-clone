import { AuthCredentials } from "./AuthCredentials"

export const validateRegister = (options: AuthCredentials) => {
    if (options.username.length <= 3) {
        return [
            {
                field: "username",
                message: "Username must be at least 4 characters long"
            }
        ]
    }
    if (options.password.length <= 3) {
        return [
            {
                field: "password",
                message: "Password must be at least 4 characters long"
            }
        ]
    }
    if (options.username.includes('@')) {
        return [
            {
                field: "username",
                message: "username cannot contains @ sign"
            }
        ]
    }
    if (!options.email.includes('@')) {
        return [
            {
                field: "email",
                message: "Invalid email"
            }
        ]
    }
    return null;
}
