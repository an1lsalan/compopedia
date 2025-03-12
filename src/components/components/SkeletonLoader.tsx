export default function SkeletonLoader() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300" />
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                    <div className="w-16 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="w-32 h-4 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>
    );
}
