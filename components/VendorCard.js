// TODO: Add vendor card component code here
import React from 'react';

const VendorCard = ({ 
  name, 
  city, 
  services, 
  price, 
  website, 
  logo, 
  description, 
  email, 
  phone 
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full overflow-hidden relative text-sm">
    
    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
    
    <div className="space-y-4">
      {/* Header with logo */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {logo ? (
            <img 
              src={logo} 
              alt={`${name} logo`} 
              className="w-12 h-12 object-contain rounded-md border border-gray-100 bg-white"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-1">{name}</h3>
          <div className="flex flex-wrap gap-1">
            <span className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {city}
            </span>
            <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {price}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-600 line-clamp-2">{description}</p>
      )}

      {/* Services */}
      <div className="bg-gray-50 rounded-lg p-2">
        <h4 className="font-medium text-gray-700 mb-1">Paslaugos:</h4>
        <ul className="space-y-1">
          {Array.isArray(services) && services.map((service, index) => (
            <li key={index} className="text-gray-600">{service}</li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="bg-blue-50 rounded-lg p-2">
        <h4 className="font-medium text-blue-700 mb-1">Kontaktai:</h4>
        <div className="space-y-1">
          {phone && <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>}
          {email && <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>}
        </div>
      </div>
    </div>

    {/* Website Button */}
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium"
    >
      Apsilankyti svetainėje
    </a>
  </div>
);

export default VendorCard;

