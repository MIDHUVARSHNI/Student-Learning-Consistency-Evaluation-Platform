import { FaEdit, FaTrash, FaPlus, FaSearch, FaChartLine, FaEnvelope } from 'react-icons/fa';

const UserTable = ({ title, users, onEdit, onDelete, onAdd, onViewProgress, onMessage, role, unreadCounts = {} }) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">{title}</h2>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium"
                >
                    <FaPlus size={16} />
                    Add New {role === 'educator' ? 'Educator' : 'Student'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : user.role === 'educator'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => onEdit(user)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            {(role === 'student' || role === 'educator') && (
                                                <button
                                                    onClick={() => onViewProgress(user)}
                                                    className="relative text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition-colors group"
                                                    title="View Progress"
                                                >
                                                    <FaChartLine size={16} />
                                                    {/* Status dot */}
                                                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${(user.isOnline && (new Date() - new Date(user.lastActive) < 5 * 60 * 1000))
                                                            ? 'bg-green-500 animate-pulse'
                                                            : 'bg-gray-400'
                                                        }`} title={user.isOnline ? 'Online' : 'Offline'}></span>
                                                </button>
                                            )}
                                            {role === 'educator' && (
                                                <button
                                                    onClick={() => onMessage(user)}
                                                    className="relative text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition-colors group"
                                                    title={unreadCounts[user._id] > 0 ? `You have ${unreadCounts[user._id]} new message${unreadCounts[user._id] > 1 ? 's' : ''}` : "Send Message"}
                                                >
                                                    <FaEnvelope size={16} />
                                                    {unreadCounts[user._id] > 0 && (
                                                        <>
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                                                                {unreadCounts[user._id]}
                                                            </span>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                You have {unreadCounts[user._id]} message{unreadCounts[user._id] > 1 ? 's' : ''}
                                                            </div>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDelete(user._id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="p-8 text-center text-gray-500 bg-gray-50">
                        <FaSearch size={40} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm mt-1">Try adding a new {role}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTable;
