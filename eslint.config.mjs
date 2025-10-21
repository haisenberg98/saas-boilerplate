import pluginJs from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';

import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';
import pluginReact from 'eslint-plugin-react';
import tailwind from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']
    },
    {
        languageOptions: {
            ecmaVersion: 'latest',
            globals: { ...globals.browser, ...globals.node }
        }
    },
    {
        settings: {
            react: {
                version: 'detect'
            }
        }
    },
    pluginJs.configs.recommended,
    importPlugin.flatConfigs.recommended,
    ...tseslint.configs.recommended,
    pluginPromise.configs['flat/recommended'],
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    eslintConfigPrettier,
    ...tailwind.configs['flat/recommended'],
    {
        rules: {
            'no-unused-vars': 'off',
            'react/react-in-jsx-scope': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react/display-name': 'off',
            'react/prop-types': 'off',
            'newline-before-return': 'error',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            'import/no-unresolved': 'off',
            'import/no-named-as-default': 'off',
            'tailwindcss/no-custom-classname': 'off',
            'tailwindcss/migration-from-tailwind-2': 'off',
            'tailwindcss/enforces-shorthand': 'off'
        }
    },
    {
        plugins: {
            '@next/next': nextPlugin
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            '@next/next/no-img-element': 'off'
        }
    },
    {
        ignores: ['.next/*']
    }
];
