import { Button } from "@/components/ui/button";
import { UseFormRegister } from "react-hook-form";

interface TextBlockInputProps {
    index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    remove: (index: number) => void;
    error?: string;
}

export default function TextBlockInput({ index, register, remove, error }: TextBlockInputProps) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium dark:text-gray-200">Block {index + 1}</h3>
                {index > 0 && (
                    <Button
                        type="button"
                        onClick={() => remove(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                        Entfernen
                    </Button>
                )}
            </div>
            <textarea
                {...register(`textBlocks.${index}.content`)}
                className={`w-full min-h-[150px] border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm dark:bg-gray-700 dark:text-gray-200 ${
                    error ? "border-red-500 dark:border-red-700" : ""
                }`}
                placeholder="// Dein Code hier..."
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
