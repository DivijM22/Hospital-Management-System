import { Droplets, CalendarDays, Mail, User } from 'lucide-react';

export default function PatientCard({ 
    name = "Unknown Patient", 
    blood_group = "N/A", 
    dob = "N/A", 
    email = "N/A", 
    gender = "N/A" 
}) {
    // Generate initials for the avatar placeholder (e.g., "John Doe" -> "JD")
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-sm w-full transition-all hover:shadow-md">
            
            {/* Header: Avatar, Name, Gender & Blood Group */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1"> 
                    {/* Avatar - Fixed size so it never shrinks */}
                    <div className="shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                        {getInitials(name)}
                    </div>
                    
                    {/* Name & Gender - min-w-0 is CRITICAL for truncation to work in flex */}
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate" title={name}>
                            {name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{gender}</p>
                    </div>
                </div>

                {/* Blood Group Badge - shrink-0 ensures it stays its full size */}
                <div className="shrink-0 flex flex-col items-center justify-center bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 min-w-[54px]">
                    <Droplets size={16} className="text-red-500 mb-0.5" />
                    <span className="text-red-700 font-bold text-sm leading-none">{blood_group}</span>
                </div>
            </div>

            {/* Body: Contact & Demographics */}
            <div className="flex flex-col gap-3 pt-5">
                <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <CalendarDays size={16} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date of Birth</span>
                        <span className="text-sm font-medium text-gray-800">{dob}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <Mail size={16} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email Address</span>
                        <span className="text-sm font-medium text-gray-800 truncate" title={email}>{email}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}