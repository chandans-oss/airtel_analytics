import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
    describe('cn (className utility)', () => {
        it('should merge class names', () => {
            const result = cn('class1', 'class2');
            expect(result).toContain('class1');
            expect(result).toContain('class2');
        });

        it('should handle conditional classes', () => {
            const result = cn('base', true && 'conditional', false && 'excluded');
            expect(result).toContain('base');
            expect(result).toContain('conditional');
            expect(result).not.toContain('excluded');
        });

        it('should merge Tailwind conflicting classes correctly', () => {
            // tailwind-merge should resolve conflicts
            const result = cn('px-2', 'px-4');
            expect(result).toBe('px-4'); // Later class wins
        });

        it('should handle array of classes', () => {
            const result = cn(['class1', 'class2']);
            expect(result).toContain('class1');
            expect(result).toContain('class2');
        });

        it('should handle objects with boolean values', () => {
            const result = cn({
                active: true,
                disabled: false,
                selected: true,
            });
            expect(result).toContain('active');
            expect(result).toContain('selected');
            expect(result).not.toContain('disabled');
        });

        it('should handle undefined and null values', () => {
            const result = cn('base', undefined, null, 'valid');
            expect(result).toContain('base');
            expect(result).toContain('valid');
        });

        it('should handle empty strings', () => {
            const result = cn('base', '', 'valid');
            expect(result).toContain('base');
            expect(result).toContain('valid');
        });

        it('should handle complex nested conditions', () => {
            const isActive = true;
            const isDisabled = false;
            const variant = 'primary';

            const result = cn(
                'base-class',
                isActive && 'active',
                isDisabled && 'disabled',
                variant === 'primary' && 'bg-primary',
                variant === 'secondary' && 'bg-secondary'
            );

            expect(result).toContain('base-class');
            expect(result).toContain('active');
            expect(result).toContain('bg-primary');
            expect(result).not.toContain('disabled');
            expect(result).not.toContain('bg-secondary');
        });

        it('should merge responsive Tailwind classes', () => {
            const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
            expect(result).toContain('text-sm');
            expect(result).toContain('md:text-base');
            expect(result).toContain('lg:text-lg');
        });

        it('should handle hover and state variants', () => {
            const result = cn('bg-blue-500', 'hover:bg-blue-700', 'active:bg-blue-900');
            expect(result).toContain('bg-blue-500');
            expect(result).toContain('hover:bg-blue-700');
            expect(result).toContain('active:bg-blue-900');
        });
    });
});
