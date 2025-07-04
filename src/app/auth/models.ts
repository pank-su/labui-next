/**
 * Интерфейс для обработки формы
 */
export interface FormInput {
    email: string,
    password: string
}

interface SignInResult {
    success: boolean,
    error: string | null
}