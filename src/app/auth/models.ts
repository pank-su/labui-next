
/**
 * Интерфейс для обработки формы
 */
interface FormInput {
    email: string,
    password: string
}

interface SignInResult{
    success: boolean,
    error: string | null
}