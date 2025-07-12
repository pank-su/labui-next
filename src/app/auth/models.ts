/**
 * Интерфейс для обработки формы
 */
export interface FormInput {
    email: string,
    password: string
}

export interface SignInResult {
    success: boolean,
    error: string | null,
    session?: any // Опциональные данные сессии для Telegram авторизации
}