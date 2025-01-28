
import { StyledComponentsRegistry } from '../lib/registry'
import './global.css'
import { BaseStyles, Box, ThemeProvider } from '@primer/react'
import styles from './styles.module.css'
import Header from './header'

export default function Layout({ children }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body>
                
                <StyledComponentsRegistry><ThemeProvider colorMode="auto">
                    <BaseStyles>
                    <div>
                        <Box className = {styles.header} bg="pageHeaderBg">
                            <Header>

                            </Header>
                        </Box>

                        <div className= {styles.content}>
                     {children}
</div>
                    </div>
                    </BaseStyles>
                </ThemeProvider>
                

                </StyledComponentsRegistry>
            </body>
        </html>
    )
}

