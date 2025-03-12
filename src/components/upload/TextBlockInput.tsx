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
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Block {index + 1}</h3>
                {index > 0 && (
                    <Button
                        type="button"
                        onClick={() => remove(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                        Entfernen
                    </Button>
                )}
            </div>
            <textarea
                {...register(`textBlocks.${index}.content`)}
                className={`w-full min-h-[150px] border border-gray-300 rounded-md p-2 font-mono text-sm ${error ? "border-red-500" : ""}`}
                placeholder="// Dein Code hier..."
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
