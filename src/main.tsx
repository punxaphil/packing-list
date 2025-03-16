import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';
import { ChakraProvider, extendTheme, withDefaultColorScheme } from '@chakra-ui/react';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { ErrorProvider } from '~/providers/ErrorProvider.tsx';
import { FullscreenModeProvider } from '~/providers/FullscreenModeProvider.tsx';

export const THEME_COLOR = 'gray';

const customTheme = extendTheme(withDefaultColorScheme({ colorScheme: THEME_COLOR }), {
  components: {
    Link: {
      baseStyle: {
        color: THEME_COLOR,
      },
    },
  },
});

const elementById = document.getElementById('root');
if (elementById) {
  ReactDOM.createRoot(elementById).render(
    <StrictMode>
      <ChakraProvider theme={customTheme}>
        <ErrorProvider>
          <FullscreenModeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </FullscreenModeProvider>
        </ErrorProvider>
      </ChakraProvider>
    </StrictMode>
  );
}
