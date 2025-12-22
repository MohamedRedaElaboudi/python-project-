import { useEffect } from 'react';
import { useColorScheme } from '@mui/material/styles';

export type ColorMode = 'light' | 'dark';

export function useColorMode() {
    const { mode, setMode } = useColorScheme();

    // Initialize mode from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as ColorMode;
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setMode(savedMode);
        }
    }, [setMode]);

    const toggleMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    const setColorMode = (newMode: ColorMode) => {
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    return {
        mode: mode as ColorMode,
        toggleMode,
        setColorMode,
    };
}
