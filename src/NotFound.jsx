export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-24">
            <div className="max-w-md text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page not found.</p>
                <a href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Go home</a>
            </div>
        </div>
    );
}