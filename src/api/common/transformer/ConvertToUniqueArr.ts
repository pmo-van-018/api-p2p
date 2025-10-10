import { Transform, TransformFnParams } from 'class-transformer';

export function ConvertToUniqueArr() {
    return Transform((value: TransformFnParams) => {
        // Remove duplicate elements from the array
        const uniqueArr = [...new Set(value.value)];
        return uniqueArr;
    });
}
