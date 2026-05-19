export default function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 ${className}`}
            {...props}
        />
    );
}
