import { MapPin, Briefcase } from 'lucide-react';

const MentorDetails = ({ mentor }) => {
  if (!mentor) return <div className="text-center mt-20">Mentor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white -xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start p-8">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-40 h-40 -full object-cover border-4 border-white shadow-md"
          />
          <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
            <p className="text-xl text-[#0072CE] font-medium">{mentor.title}</p>
            <p className="text-gray-600">{mentor.company}</p>
            <div className="flex items-center justify-center md:justify-start mt-2 text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{mentor.location}</span>
              <Briefcase className="w-4 h-4 ml-4 mr-1" />
              <span>{mentor.experience}</span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
          <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
        </div>

        <div className="px-8 pb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-gray-900">R{mentor.hourlyRate}</span>
              <span className="text-gray-600"> / hour</span>
            </div>
            <button className="bg-[#0072CE] text-white px-6 py-2 -lg hover:bg-[#1A1F5E] transition">
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetails;
